import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { LocationsModule } from './locations/locations.module';
import { SalesModule } from './sales/sales.module';
import { StockModule } from './stock/stock.module';
import { SalesHistoryModule } from './sales-history/sales-history.module';
import { ProductsModule } from './products/products.module';
import { ProvidersModule } from './providers/providers.module';

import { FirebaseService } from './shared/firebase.service'; // 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('CARNICERIA_DB_HOST');
        const port = config.get<number>('CARNICERIA_DB_PORT');
        const username = config.get<string>('CARNICERIA_DB_USER');
        const password = config.get<string>('CARNICERIA_DB_PASS');
        const database = config.get<string>('CARNICERIA_DB_NAME');
        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    AuthModule,
    LocationsModule,
    SalesModule,
    StockModule,
    SalesHistoryModule,
    ProductsModule,
    ProvidersModule,
  ],
  providers: [FirebaseService], 
  exports: [FirebaseService],   
})
export class AppModule {}
