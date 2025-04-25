import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';

import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { Location } from 'src/locations/entities/location.entity';
import { User } from 'src/auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sale,
      SaleItem,
      Product,
      Location,
      User,
    ]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
