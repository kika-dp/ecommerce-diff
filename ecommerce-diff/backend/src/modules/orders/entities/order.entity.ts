import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/base.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../../../common/enums/order-status.enum';

@Entity({ name: 'orders' })
export class Order extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 30 })
  orderNumber: string;

  @ManyToOne(() => User, (u) => u.orders, { onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  shippingFee: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  taxAmount: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total: string;

  @Column({ type: 'varchar', length: 32, default: 'COD' })
  paymentMethod: string;

  @Column({ type: 'jsonb' })
  shippingAddress: {
    fullName: string;
    mobile: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
    landmark?: string | null;
  };

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @OneToMany(() => OrderItem, (oi) => oi.order, { cascade: true, eager: true })
  items: OrderItem[];
}
