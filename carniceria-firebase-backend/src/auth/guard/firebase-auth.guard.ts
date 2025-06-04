// src/auth/guard/firebase-auth.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWT_KEY, TOKEN_NAME } from 'src/constants/jwt.constants';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    let token = this.extractTokenFromHeader(request);

    if (!token) {
      token = request.cookies?.[TOKEN_NAME];
      console.log('🔐 Token desde cookie:', token);
    }

    if (!token) {
      throw new UnauthorizedException('Token no encontrado');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: JWT_KEY,
      });

      console.log('✅ Token válido:', payload);
      request.user = payload;
    } catch (err) {
      console.error('❌ Token inválido:', err.message);
      throw new UnauthorizedException('Token inválido o expirado');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
