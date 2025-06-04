// src/products/dto/create-product.dto.ts

import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {

  @ApiProperty({ description: 'Nombre del producto' })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ description: 'Precio por kg del producto' })
  @IsNumber()
  precio_por_kg: number;

  @ApiProperty({ description: 'Unidad de medida (ej. kg, pieza)' })
  @IsString()
  unidad_medida: string;

  @ApiProperty({ description: 'Cantidad actual en stock' })
  @IsNumber()
  stock_actual: number;

  @ApiProperty({ description: 'Stock mínimo recomendado' })
  @IsNumber()
  stock_minimo: number;

  @ApiProperty({ description: '¿Está disponible?', default: true })
  @IsBoolean()
  disponible: boolean;

  @ApiProperty({ description: 'ID de la sucursal donde se encuentra el producto' })
  @IsString()
  locationId: string;

  @ApiProperty({ description: 'ID del proveedor asociado' })
  @IsString()
  providerId: string;
}
