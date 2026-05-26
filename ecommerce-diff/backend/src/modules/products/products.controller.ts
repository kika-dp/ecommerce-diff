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
import { ProductsService } from './products.service';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto/product.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Public()
  @Get()
  async list(@Query() query: ProductQueryDto) {
    const result = await this.service.findAll(query);
    return { message: 'Products fetched', data: result.items, meta: result.meta };
  }

  @Public()
  @Get('slug/:slug')
  async bySlug(@Param('slug') slug: string) {
    const data = await this.service.findBySlug(slug);
    return { message: 'Product fetched', data };
  }

  @Public()
  @Get(':id')
  async one(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return { message: 'Product fetched', data };
  }

  @Public()
  @Get(':id/similar')
  async similar(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findSimilar(id);
    return { message: 'Similar products fetched', data };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() dto: CreateProductDto) {
    const data = await this.service.create(dto);
    return { message: 'Product created', data };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    const data = await this.service.update(id, dto);
    return { message: 'Product updated', data };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return { message: 'Product deleted', data: null };
  }
}
