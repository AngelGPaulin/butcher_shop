import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateProviderDto {
  @ApiProperty({
    example: 'Frigorífico Don Pepe',
    description: 'Nombre del proveedor',
  })
  @IsString()
  nombre: string;

  @ApiProperty({
    example: 'Juan Pérez - 1155555555',
    description: 'Información de contacto del proveedor',
  })
  @IsString()
  contacto: string;

  @ApiProperty({
    example: 'Av. Siempre Viva 742',
    description: 'Dirección del proveedor (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiProperty({
    example: '1155555555',
    description: 'Teléfono del proveedor (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  telefono?: string;
}
