import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductType } from './entities/product-type.entity';
import { ProductTypesService } from './product-types.service';
import { ProductTypesController } from './product-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductType])],
  providers: [ProductTypesService],
  controllers: [ProductTypesController],
  exports: [ProductTypesService],
})
export class ProductTypesModule {}
