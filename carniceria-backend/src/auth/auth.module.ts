import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { SharedModule } from '../shared/shared.module';

import { User } from './entities/user.entity';
import { JWT_KEY, EXPIRES_IN } from './constants/jwt.constants';
import { share } from 'rxjs';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: JWT_KEY,
      signOptions: {
        expiresIn: EXPIRES_IN,
      },
      global: true,
    }),
    SharedModule, 
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
