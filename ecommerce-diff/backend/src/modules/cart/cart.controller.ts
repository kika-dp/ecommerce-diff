import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  async list(@CurrentUser() user: AuthUser) {
    const result = await this.cart.list(user.id);
    return { message: 'Cart fetched', data: result };
  }

  @Post('items')
  async add(@CurrentUser() user: AuthUser, @Body() dto: AddCartItemDto) {
    const data = await this.cart.add(user.id, dto);
    return { message: 'Item added to cart', data };
  }

  @Patch('items/:id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const data = await this.cart.update(user.id, id, dto);
    return { message: 'Cart item updated', data };
  }

  @Delete('items/:id')
  async remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.cart.remove(user.id, id);
    return { message: 'Cart item removed', data: null };
  }

  @Delete()
  async clear(@CurrentUser() user: AuthUser) {
    await this.cart.clear(user.id);
    return { message: 'Cart cleared', data: null };
  }
}
