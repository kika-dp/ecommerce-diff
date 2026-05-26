import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto/product.dto';
import { slugify } from '../../common/utils/slug.util';
import { buildPaginationMeta } from '../../common/utils/pagination.util';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductImage) private readonly imageRepo: Repository<ProductImage>,
    @InjectRepository(ProductVariant) private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const slug = await this.uniqueSlug(slugify(dto.name));
    const skuExists = await this.productRepo.findOne({ where: { sku: dto.sku } });
    if (skuExists) throw new ConflictException('SKU already exists');

    const product = this.productRepo.create({
      name: dto.name,
      slug,
      sku: dto.sku,
      shortDescription: dto.shortDescription,
      description: dto.description,
      brand: dto.brand,
      price: dto.price,
      compareAtPrice: dto.compareAtPrice,
      stock: dto.stock,
      isActive: dto.isActive ?? true,
      isFeatured: dto.isFeatured ?? false,
      isTrending: dto.isTrending ?? false,
      isBestseller: dto.isBestseller ?? false,
      productTypeId: dto.productTypeId,
      images: dto.images.map((img, idx) =>
        this.imageRepo.create({ ...img, position: img.position ?? idx, isPrimary: img.isPrimary ?? idx === 0 }),
      ),
      variants: dto.variants?.map((v) => this.variantRepo.create(v)) ?? [],
    });
    return this.productRepo.save(product);
  }

  async findAll(query: ProductQueryDto) {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.productType', 'pt')
      .leftJoinAndSelect('p.images', 'img')
      .leftJoinAndSelect('p.variants', 'variant');

    if (query.search) {
      qb.andWhere(
        new Brackets((b) =>
          b
            .where('p.name ILIKE :search', { search: `%${query.search}%` })
            .orWhere('p.brand ILIKE :search', { search: `%${query.search}%` })
            .orWhere('p.sku ILIKE :search', { search: `%${query.search}%` }),
        ),
      );
    }
    if (query.productTypeId) qb.andWhere('p.productTypeId = :ptId', { ptId: query.productTypeId });
    if (query.productTypeSlug) qb.andWhere('pt.slug = :slug', { slug: query.productTypeSlug });
    if (query.minPrice !== undefined) qb.andWhere('p.price >= :minP', { minP: query.minPrice });
    if (query.maxPrice !== undefined) qb.andWhere('p.price <= :maxP', { maxP: query.maxPrice });
    if (query.minRating !== undefined) qb.andWhere('p.rating >= :minR', { minR: query.minRating });
    if (query.inStock) qb.andWhere('p.stock > 0');
    if (query.featured) qb.andWhere('p.isFeatured = true');
    if (query.trending) qb.andWhere('p.isTrending = true');
    if (query.bestseller) qb.andWhere('p.isBestseller = true');

    const order = (query.sortBy as keyof Product) || 'createdAt';
    qb.orderBy(`p.${order}`, query.sortOrder ?? 'DESC');
    qb.skip(query.skip).take(query.limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, meta: buildPaginationMeta(total, query.page, query.limit) };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['productType', 'images', 'variants'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { slug },
      relations: ['productType', 'images', 'variants'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findSimilar(id: string, limit = 6): Promise<Product[]> {
    const product = await this.findOne(id);
    return this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.images', 'img')
      .where('p.productTypeId = :ptId', { ptId: product.productTypeId })
      .andWhere('p.id != :id', { id })
      .andWhere('p.isActive = true')
      .orderBy('p.rating', 'DESC')
      .take(limit)
      .getMany();
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    if (dto.name && dto.name !== product.name) {
      product.slug = await this.uniqueSlug(slugify(dto.name), id);
    }
    Object.assign(product, {
      ...dto,
      images: undefined,
      variants: undefined,
    });

    if (dto.images) {
      await this.imageRepo.delete({ productId: id });
      product.images = dto.images.map((img, idx) =>
        this.imageRepo.create({
          ...img,
          productId: id,
          position: img.position ?? idx,
          isPrimary: img.isPrimary ?? idx === 0,
        }),
      );
    }
    if (dto.variants) {
      await this.variantRepo.delete({ productId: id });
      product.variants = dto.variants.map((v) => this.variantRepo.create({ ...v, productId: id }));
    }

    return this.productRepo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepo.softRemove(product);
  }

  async decrementStock(productId: string, variantId: string | null, qty: number): Promise<void> {
    if (variantId) {
      await this.variantRepo.decrement({ id: variantId }, 'stock', qty);
    }
    await this.productRepo.decrement({ id: productId }, 'stock', qty);
  }

  private async uniqueSlug(base: string, ignoreId?: string): Promise<string> {
    let slug = base;
    let n = 0;
    while (true) {
      const existing = await this.productRepo.findOne({ where: { slug } });
      if (!existing || existing.id === ignoreId) return slug;
      n += 1;
      slug = `${base}-${n}`;
    }
  }
}
