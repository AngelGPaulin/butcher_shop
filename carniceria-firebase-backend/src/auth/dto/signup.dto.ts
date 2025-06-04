// src/auth/dto/signup.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  @MinLength(6)
  contrasena: string;

  @IsEmail()
  email: string;

  @IsString()
  rol: string; // "Admin" o "Employee"
}
