import {
    Controller,
    Post,
    Body,
    Param,
    Patch,
    Query,
    BadRequestException,
    Res,
    ParseUUIDPipe,
  } from '@nestjs/common';
  import { ApiTags, ApiOperation } from '@nestjs/swagger';
  import { Response } from 'express';
  
  import { AuthService } from './auth.service';
  import { CreateUserDto } from './dto/create-user.dto';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { LoginUserDto } from './dto/login-user.dto';
  import { TOKEN_NAME } from './constants/jwt.constants';
  import { Cookies } from './decorators/cookies.decorator';
  import { ROLES } from './constants/roles.constants';
  
  @ApiTags('Auth')
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @ApiOperation({ summary: 'Registrar un usuario para un empleado' })
    @Post('register/:id')
    register(
      @Query('role') role: string,
      @Body() createUserDto: CreateUserDto,
      @Param('id', ParseUUIDPipe) id: string,
    ) {
      if (role === ROLES.EMPLOYEE) {
        return this.authService.registerEmployee(id, createUserDto);
      }
  
      throw new BadRequestException('Rol inválido');
    }
  
    @ApiOperation({ summary: 'Iniciar sesión de usuario' })
    @Post('login')
    async login(
      @Body() loginUserDto: LoginUserDto,
      @Res({ passthrough: true }) response: Response,
      @Cookies() cookies: any,
    ) {
      const result = await this.authService.loginUser(loginUserDto);
  
      response.cookie(TOKEN_NAME, result[TOKEN_NAME], {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
      });
  
      return result.user;
    }
  
    @ApiOperation({ summary: 'Actualizar información del usuario' })
    @Patch(':userId')
    updateUser(
      @Param('userId', ParseUUIDPipe) userId: string,
      @Body() updateUserDto: UpdateUserDto,
    ) {
      return this.authService.updateUser(userId, updateUserDto);
    }
  }
  