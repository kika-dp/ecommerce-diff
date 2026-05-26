import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/base.entity';
import { ProductType } from '../../product-types/entities/product-type.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';

@Entity({ name: 'products' })
export class Product extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 220 })
  slug: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 60 })
  sku: string;

  @Column({ type: 'text' })
  shortDescription: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  brand?: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  compareAtPrice?: string | null;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'numeric', precision: 3, scale: 2, default: 0 })
  rating: string;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'boolean', default: false })
  isTrending: boolean;

  @Column({ type: 'boolean', default: false })
  isBestseller: boolean;

  @ManyToOne(() => ProductType, (pt) => pt.products, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_type_id' })
  productType: ProductType;

  @Column({ name: 'product_type_id' })
  productTypeId: string;

  @OneToMany(() => ProductImage, (img) => img.product, { cascade: true, eager: true })
  images: ProductImage[];

  @OneToMany(() => ProductVariant, (v) => v.product, { cascade: true, eager: true })
  variants: ProductVariant[];
}
