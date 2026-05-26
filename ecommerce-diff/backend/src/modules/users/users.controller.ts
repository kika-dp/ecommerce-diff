import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateAddressDto } from './dto/create-address.dto';
import { UserStatus } from '../../common/enums/user-status.enum';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    const data = await this.users.findById(user.id);
    return { message: 'Profile fetched', data };
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto) {
    const data = await this.users.update(user.id, dto);
    return { message: 'Profile updated', data };
  }

  @Get('me/addresses')
  async myAddresses(@CurrentUser() user: AuthUser) {
    const data = await this.users.listAddresses(user.id);
    return { message: 'Addresses fetched', data };
  }

  @Post('me/addresses')
  async addAddress(@CurrentUser() user: AuthUser, @Body() dto: CreateAddressDto) {
    const data = await this.users.createAddress(user.id, dto);
    return { message: 'Address added', data };
  }

  @Delete('me/addresses/:id')
  async deleteAddress(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.users.deleteAddress(user.id, id);
    return { message: 'Address removed', data: null };
  }

  // ---------- Admin endpoints ----------
  @Roles(Role.ADMIN)
  @Get()
  async list(@Query() query: PaginationDto) {
    const result = await this.users.findAll(query);
    return { message: 'Users fetched', data: result.items, meta: result.meta };
  }

  @Roles(Role.ADMIN)
  @Patch(':id/status')
  async setStatus(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: UserStatus) {
    const data = await this.users.setStatus(id, status);
    return { message: 'User status updated', data };
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.users.remove(id);
    return { message: 'User deleted', data: null };
  }
}
