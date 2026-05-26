import { Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}

  @Get()
  async list(@CurrentUser() user: AuthUser) {
    const data = await this.wishlist.list(user.id);
    return { message: 'Wishlist fetched', data };
  }

  @Post(':productId')
  async add(@CurrentUser() user: AuthUser, @Param('productId', ParseUUIDPipe) productId: string) {
    const data = await this.wishlist.add(user.id, productId);
    return { message: 'Added to wishlist', data };
  }

  @Delete(':productId')
  async remove(@CurrentUser() user: AuthUser, @Param('productId', ParseUUIDPipe) productId: string) {
    await this.wishlist.remove(user.id, productId);
    return { message: 'Removed from wishlist', data: null };
  }
}
