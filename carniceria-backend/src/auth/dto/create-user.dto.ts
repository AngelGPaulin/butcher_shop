import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength, IsUUID } from 'class-validator';
import { ROLES } from '../constants/roles.constants';

export class CreateUserDto {
  @ApiProperty({ example: 'Carlos' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  apellido: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  telefono: string;

  @ApiProperty({ example: 'Calle Falsa 123' })
  @IsString()
  direccion: string;

  @ApiProperty({ example: 'carlosp' })
  @IsString()
  nombre_usuario: string;

  @ApiProperty({ example: 'securepass' })
  @IsString()
  @MinLength(6)
  contrasena: string;

  @ApiProperty({ enum: ROLES, example: ROLES.EMPLOYEE })
  @IsEnum(ROLES)
  rol: ROLES;

  @ApiProperty({ example: 'e65f4c3a-43df-40ad-a822-28513ef8b031' })
  @IsUUID()
  locationId: string;
}
