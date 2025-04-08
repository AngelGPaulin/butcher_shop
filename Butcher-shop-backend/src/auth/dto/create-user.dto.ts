import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';
import { ROLES } from '../constants/roles.constants';

export class CreateUserDto {
  @ApiProperty({ example: 'usuario123' })
  @IsString()
  nombre_usuario: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(6)
  contrasena: string;

  @ApiProperty({ example: ROLES.EMPLOYEE, enum: ROLES })
  @IsEnum(ROLES)
  rol: ROLES;
}
