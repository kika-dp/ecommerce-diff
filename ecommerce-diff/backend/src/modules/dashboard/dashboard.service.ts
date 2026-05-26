import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
  ) {}

  async overview() {
    const [totalUsers, totalProducts, totalOrders, deliveredOrders] = await Promise.all([
      this.users.count(),
      this.products.count(),
      this.orders.count(),
      this.orders.find({ where: { status: OrderStatus.DELIVERED } }),
    ]);
    const revenue = deliveredOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);

    const recentOrders = await this.orders.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const statusBreakdown = await this.orders
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.status')
      .getRawMany();

    return {
      cards: {
        totalUsers,
        totalProducts,
        totalOrders,
        revenue: revenue.toFixed(2),
      },
      recentOrders,
      statusBreakdown,
    };
  }
}
