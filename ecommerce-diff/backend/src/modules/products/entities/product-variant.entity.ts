import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../shared/base.entity';
import { Product } from './product.entity';

@Entity({ name: 'product_variants' })
export class ProductVariant extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 80 })
  sku: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  priceOverride?: string | null;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  attributes: Record<string, string>;

  @ManyToOne(() => Product, (p) => p.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id' })
  productId: string;
}
