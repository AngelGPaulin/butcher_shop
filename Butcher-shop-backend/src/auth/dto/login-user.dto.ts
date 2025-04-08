import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty()
  @IsString()
  nombre_usuario: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  contrasena: string;
}
