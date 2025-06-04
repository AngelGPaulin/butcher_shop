// src/providers/providers.module.ts

import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { FirebaseService } from '../shared/firebase.service';

@Module({
  controllers: [ProvidersController],
  providers: [ProvidersService, FirebaseService],
})
export class ProvidersModule {}
