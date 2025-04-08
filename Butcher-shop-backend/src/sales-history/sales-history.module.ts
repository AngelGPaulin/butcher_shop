import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesHistoryService } from './sales-history.service';
import { SalesHistoryController } from './sales-history.controller';
import { Sale } from 'src/sales/entities/sale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale])],
  controllers: [SalesHistoryController],
  providers: [SalesHistoryService],
})
export class SalesHistoryModule {}
