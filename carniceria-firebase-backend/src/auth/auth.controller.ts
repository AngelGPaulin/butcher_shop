import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Res,
  Get,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express'; 
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TOKEN_NAME } from '../constants/jwt.constants';
import { LoginUserDto } from './dto/login.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('ping')
  ping() {
    return { ok: true };
  }


  @ApiOperation({ summary: 'Registrar un usuario (Admin o Employee)' })
  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.authService.registerUser(dto);
  }

  @ApiOperation({ summary: 'Login con email y contraseña' })
  @Post('login')
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginUser(dto);

    res.cookie(TOKEN_NAME, result[TOKEN_NAME], {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return result.user;
  }

  @ApiOperation({ summary: 'Login con Firebase Auth (sin contraseña)' })
  @Post('firebase-login')
  async firebaseLogin(@Body('email') email: string, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.loginWithFirebase(email);

    res.cookie(TOKEN_NAME, result[TOKEN_NAME], {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return result.user;
  }

  @ApiOperation({ summary: 'Actualizar usuario' })
  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.authService.updateUser(id, dto);
  }

  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @Get()
  findAllUsers() {
    return this.authService.findAll();
  }

  @ApiOperation({ summary: 'Eliminar usuario' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(id);
  }

  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @UseGuards(JwtAuthGuard)
  @Get("me")
  getMe(@Req() req: Request) {
    const user = req["user"];
    return {
      userId: user.userId,
      nombre_usuario: user.nombre_usuario,
      userRoles: Array.isArray(user.rol) ? user.rol : [user.rol],
    };
  }
}
