import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'carlos@example.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securepass' })
  @IsString()
  @MinLength(6)
  contrasena: string;

}
