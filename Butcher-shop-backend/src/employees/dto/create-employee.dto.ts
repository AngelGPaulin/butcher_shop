import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del empleado',
  })
  @IsString()
  @MaxLength(100)
  nombre_completo: string;

  @ApiProperty({
    example: '5551234567',
    description: 'Teléfono del empleado',
  })
  @IsString()
  @MaxLength(15)
  telefono: string;

  @ApiProperty({
    example: 'Calle Falsa 123, Ciudad',
    description: 'Dirección del empleado',
  })
  @IsString()
  direccion: string;
}
