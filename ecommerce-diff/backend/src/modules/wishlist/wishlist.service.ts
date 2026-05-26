import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from './entities/wishlist-item.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem) private readonly repo: Repository<WishlistItem>,
  ) {}

  list(userId: string) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async add(userId: string, productId: string) {
    const exists = await this.repo.findOne({ where: { userId, productId } });
    if (exists) throw new ConflictException('Already in wishlist');
    const item = this.repo.create({ userId, productId });
    return this.repo.save(item);
  }

  async remove(userId: string, productId: string) {
    const item = await this.repo.findOne({ where: { userId, productId } });
    if (!item) throw new NotFoundException('Wishlist item not found');
    await this.repo.remove(item);
  }
}
