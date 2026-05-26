import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { OrderQueryDto, PlaceOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  async place(@CurrentUser() user: AuthUser, @Body() dto: PlaceOrderDto) {
    const data = await this.orders.placeOrder(user.id, dto);
    return { message: 'Order placed successfully', data };
  }

  @Get('mine')
  async myOrders(@CurrentUser() user: AuthUser, @Query() query: OrderQueryDto) {
    const result = await this.orders.listForUser(user.id, query);
    return { message: 'Orders fetched', data: result.items, meta: result.meta };
  }

  @Get('mine/:id')
  async myOrder(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.orders.findOne(id, user.id);
    return { message: 'Order fetched', data };
  }

  @Patch('mine/:id/cancel')
  async cancel(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.orders.cancel(user.id, id);
    return { message: 'Order cancelled', data };
  }

  // ----- Admin -----
  @Roles(Role.ADMIN)
  @Get()
  async listAll(@Query() query: OrderQueryDto) {
    const result = await this.orders.listAll(query);
    return { message: 'Orders fetched', data: result.items, meta: result.meta };
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  async one(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.orders.findOne(id);
    return { message: 'Order fetched', data };
  }

  @Roles(Role.ADMIN)
  @Patch(':id/status')
  async setStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOrderStatusDto) {
    const data = await this.orders.updateStatus(id, dto);
    return { message: 'Order status updated', data };
  }
}
