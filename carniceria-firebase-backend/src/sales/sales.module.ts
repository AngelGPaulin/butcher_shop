// src/sales/sales.module.ts

import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { FirebaseService } from '../shared/firebase.service';

@Module({
  controllers: [SalesController],
  providers: [SalesService, FirebaseService],
})
export class SalesModule {}
