// src/locations/locations.module.ts

import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule], 
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
