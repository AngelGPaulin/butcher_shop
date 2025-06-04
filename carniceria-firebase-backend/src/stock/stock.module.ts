// src/stock/stock.module.ts

import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { FirebaseService } from '../shared/firebase.service';

@Module({
  controllers: [StockController],
  providers: [StockService, FirebaseService],
})
export class StockModule {}
