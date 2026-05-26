import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { OrderQueryDto, PlaceOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { buildPaginationMeta } from '../../common/utils/pagination.util';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemRepo: Repository<OrderItem>,
    @InjectRepository(CartItem) private readonly cartRepo: Repository<CartItem>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async placeOrder(userId: string, dto: PlaceOrderDto): Promise<Order> {
    const cartItems = await this.cartRepo.find({ where: { userId } });
    if (!cartItems.length) throw new BadRequestException('Cart is empty');

    return this.dataSource.transaction(async (manager) => {
      let subtotal = 0;
      const orderItems: OrderItem[] = [];

      for (const ci of cartItems) {
        const product = await manager.findOne(Product, {
          where: { id: ci.productId },
          relations: ['images', 'variants'],
        });
        if (!product || !product.isActive) {
          throw new BadRequestException(`Product unavailable: ${ci.productId}`);
        }
        const variant = ci.variantId ? product.variants.find((v) => v.id === ci.variantId) : null;
        const stock = variant ? variant.stock : product.stock;
        if (stock < ci.quantity) {
          throw new BadRequestException(`Insufficient stock for ${product.name}`);
        }
        const unitPrice = parseFloat(variant?.priceOverride ?? product.price);
        const lineTotal = unitPrice * ci.quantity;
        subtotal += lineTotal;

        orderItems.push(
          manager.create(OrderItem, {
            productId: product.id,
            variantId: variant?.id ?? null,
            productName: product.name,
            productSku: variant?.sku ?? product.sku,
            productImage: product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url,
            unitPrice: unitPrice.toFixed(2),
            quantity: ci.quantity,
            lineTotal: lineTotal.toFixed(2),
          }),
        );

        if (variant) {
          await manager.decrement(Product, { id: product.id }, 'stock', ci.quantity);
          variant.stock -= ci.quantity;
          await manager.save(variant);
        } else {
          await manager.decrement(Product, { id: product.id }, 'stock', ci.quantity);
        }
      }

      const shippingFee = subtotal >= 5000 ? 0 : 99;
      const taxAmount = +(subtotal * 0.05).toFixed(2);
      const total = subtotal + shippingFee + taxAmount;

      const order = manager.create(Order, {
        orderNumber: `AURA-${Date.now().toString(36).toUpperCase()}`,
        userId,
        status: OrderStatus.PENDING,
        subtotal: subtotal.toFixed(2),
        shippingFee: shippingFee.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        total: total.toFixed(2),
        paymentMethod: 'COD',
        shippingAddress: dto.shippingAddress,
        notes: dto.notes,
        items: orderItems,
      });
      const saved = await manager.save(order);
      await manager.delete(CartItem, { userId });
      return saved;
    });
  }

  async listForUser(userId: string, query: OrderQueryDto) {
    const where: any = { userId };
    if (query.status) where.status = query.status;
    const [items, total] = await this.orderRepo.findAndCount({
      where,
      take: query.limit,
      skip: query.skip,
      order: { createdAt: query.sortOrder ?? 'DESC' },
    });
    return { items, meta: buildPaginationMeta(total, query.page, query.limit) };
  }

  async listAll(query: OrderQueryDto) {
    const where: any = {};
    if (query.status) where.status = query.status;
    const [items, total] = await this.orderRepo.findAndCount({
      where,
      take: query.limit,
      skip: query.skip,
      order: { createdAt: query.sortOrder ?? 'DESC' },
    });
    return { items, meta: buildPaginationMeta(total, query.page, query.limit) };
  }

  async findOne(id: string, userId?: string): Promise<Order> {
    const where: any = { id };
    if (userId) where.userId = userId;
    const order = await this.orderRepo.findOne({ where });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    order.status = dto.status;
    return this.orderRepo.save(order);
  }

  async cancel(userId: string, id: string): Promise<Order> {
    const order = await this.findOne(id, userId);
    if ([OrderStatus.DELIVERED, OrderStatus.SHIPPED].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }
    order.status = OrderStatus.CANCELLED;
    return this.orderRepo.save(order);
  }
}
