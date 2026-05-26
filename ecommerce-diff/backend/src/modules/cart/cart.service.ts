import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem) private readonly cartRepo: Repository<CartItem>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
  ) {}

  async list(userId: string) {
    const items = await this.cartRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    const subtotal = items.reduce((sum, item) => {
      const price = parseFloat(item.variant?.priceOverride ?? item.product.price);
      return sum + price * item.quantity;
    }, 0);
    return {
      items,
      summary: {
        subtotal: subtotal.toFixed(2),
        itemCount: items.reduce((c, i) => c + i.quantity, 0),
      },
    };
  }

  async add(userId: string, dto: AddCartItemDto) {
    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
      relations: ['variants'],
    });
    if (!product || !product.isActive) throw new NotFoundException('Product not available');

    if (dto.variantId) {
      const variant = product.variants.find((v) => v.id === dto.variantId);
      if (!variant) throw new NotFoundException('Variant not found');
      if (variant.stock < dto.quantity) throw new BadRequestException('Insufficient variant stock');
    } else if (product.stock < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const existing = await this.cartRepo.findOne({
      where: { userId, productId: dto.productId, variantId: dto.variantId ?? IsNull() },
    });
    if (existing) {
      existing.quantity += dto.quantity;
      return this.cartRepo.save(existing);
    }
    const item = this.cartRepo.create({
      userId,
      productId: dto.productId,
      variantId: dto.variantId ?? null,
      quantity: dto.quantity,
    });
    return this.cartRepo.save(item);
  }

  async update(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.cartRepo.findOne({ where: { id: itemId, userId } });
    if (!item) throw new NotFoundException('Cart item not found');
    item.quantity = dto.quantity;
    return this.cartRepo.save(item);
  }

  async remove(userId: string, itemId: string) {
    const item = await this.cartRepo.findOne({ where: { id: itemId, userId } });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.cartRepo.remove(item);
  }

  async clear(userId: string) {
    await this.cartRepo.delete({ userId });
  }
}
