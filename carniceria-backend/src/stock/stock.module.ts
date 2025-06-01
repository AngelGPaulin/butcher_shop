import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { StockMovement } from './entities/stock-movement.entity';
import { Product } from 'src/products/entities/product.entity';
import { Location } from 'src/locations/entities/location.entity';
import { User } from 'src/auth/entities/user.entity';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockMovement, Product, Location, User]),SharedModule,
  ],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}
