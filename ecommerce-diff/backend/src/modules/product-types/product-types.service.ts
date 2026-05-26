import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ProductType } from './entities/product-type.entity';
import { CreateProductTypeDto, UpdateProductTypeDto } from './dto/product-type.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { buildPaginationMeta } from '../../common/utils/pagination.util';
import { slugify } from '../../common/utils/slug.util';

@Injectable()
export class ProductTypesService {
  constructor(
    @InjectRepository(ProductType) private readonly repo: Repository<ProductType>,
  ) {}

  async create(dto: CreateProductTypeDto) {
    const slug = slugify(dto.name);
    const exists = await this.repo.findOne({ where: { slug } });
    if (exists) throw new ConflictException('Category with this name already exists');
    const entity = this.repo.create({ ...dto, slug, isActive: dto.isActive ?? true });
    return this.repo.save(entity);
  }

  async findAll(query: PaginationDto) {
    const where = query.search ? { name: ILike(`%${query.search}%`) } : {};
    const [items, total] = await this.repo.findAndCount({
      where,
      take: query.limit,
      skip: query.skip,
      order: { createdAt: query.sortOrder ?? 'DESC' },
    });
    return { items, meta: buildPaginationMeta(total, query.page, query.limit) };
  }

  async findActive(): Promise<ProductType[]> {
    return this.repo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Product type not found');
    return entity;
  }

  async findBySlug(slug: string) {
    const entity = await this.repo.findOne({ where: { slug } });
    if (!entity) throw new NotFoundException('Product type not found');
    return entity;
  }

  async update(id: string, dto: UpdateProductTypeDto) {
    const entity = await this.findOne(id);
    if (dto.name && dto.name !== entity.name) {
      entity.slug = slugify(dto.name);
    }
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string) {
    const entity = await this.findOne(id);
    await this.repo.softRemove(entity);
  }
}
