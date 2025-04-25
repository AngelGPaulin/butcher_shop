import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'carlosp' })
  @IsString()
  nombre_usuario: string;

  @ApiProperty({ example: 'securepass' })
  @IsString()
  @MinLength(6)
  contrasena: string;
}
