import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWT_KEY, TOKEN_NAME } from '../constants/jwt.constants';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();


    let token = this.extractTokenFromHeader(request);

    if (!token) {

      token = request.cookies?.[TOKEN_NAME];
      console.log("🔑 Token desde cookie:", token);

      if (!token) {
        throw new UnauthorizedException('Token no encontrado');
      }
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: JWT_KEY,
      });

      console.log("✅ Token válido. Payload:", payload);
      request.user = payload;
    } catch (err) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
