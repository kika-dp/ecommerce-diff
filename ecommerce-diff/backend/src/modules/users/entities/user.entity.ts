import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../../shared/base.entity';
import { Role } from '../../../common/enums/role.enum';
import { UserStatus } from '../../../common/enums/user-status.enum';
import { Order } from '../../orders/entities/order.entity';
import { Address } from './address.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { WishlistItem } from '../../wishlist/entities/wishlist-item.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 160 })
  email: string;

  @Column({ type: 'varchar', length: 120 })
  fullName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  mobile?: string | null;

  @Exclude()
  @Column({ type: 'varchar', length: 200 })
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
  status: UserStatus;

  @Column({ type: 'varchar', length: 10, nullable: true })
  otpCode?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  otpExpiresAt?: Date | null;

  @Exclude()
  @Column({ type: 'varchar', length: 500, nullable: true })
  refreshTokenHash?: string | null;

  @OneToMany(() => Address, (a) => a.user)
  addresses: Address[];

  @OneToMany(() => Order, (o) => o.user)
  orders: Order[];

  @OneToMany(() => CartItem, (c) => c.user)
  cartItems: CartItem[];

  @OneToMany(() => WishlistItem, (w) => w.user)
  wishlistItems: WishlistItem[];
}
