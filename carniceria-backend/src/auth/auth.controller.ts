import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Res,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { TOKEN_NAME } from './constants/jwt.constants';
import { Cookies } from './decorators/cookies.decorator';
import { Auth } from './decorators/auth.decorator';
import { ROLES } from 'src/auth/constants/roles.constants';
import { IsEmail, IsString } from 'class-validator';

class FirebaseLoginDto {
  @IsEmail()
  email: string;
}
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Registrar un usuario (Admin o Employee)' })
  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
    @Cookies() cookies: any,
  ) {
    const result = await this.authService.loginUser(loginUserDto);
    console.log("LOGIN RESULT:", result);
    console.log("COOKIES:", cookies);

    response.cookie(TOKEN_NAME, result[TOKEN_NAME], {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    });
    return result.user;
  }

  @ApiOperation({ summary: 'Actualizar usuario' })
  @Patch(':userId')
  updateUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.updateUser(userId, updateUserDto);
  }
  @Get()
  @Auth(ROLES.ADMIN)
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  findAllUsers() {
    return this.authService.findAll(); 

}
@Post('firebase-login')
async firebaseLogin(
  @Body('email') email: string,
  @Res({ passthrough: true }) res: Response,
  @Cookies() cookies: any,
) {
  console.log('🔥 Firebase login recibido para:', email);
  console.log('➡️ Cookies actuales del cliente:', cookies);

  const result = await this.authService.loginWithFirebase(email);

  console.log('✅ Usuario verificado en BD:', result);

  res.cookie(TOKEN_NAME, result[TOKEN_NAME], {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  console.log('🍪 Cookie enviada al frontend con token:', result[TOKEN_NAME]);

  return result.user;
}

}
