import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../entities/product.entity';
import { OmitType } from '@nestjs/mapped-types';

export class CreateProductDto extends OmitType(Product, ['productId'] as const) {
  @ApiProperty({ required: false })
  @IsUUID('4')
  @IsOptional()
  productId?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty()
  @IsNumber()
  precio_por_kg: number;

  @ApiProperty()
  @IsString()
  unidad_medida: string;

  @ApiProperty()
  @IsNumber()
  stock_actual: number;

  @ApiProperty()
  @IsNumber()
  stock_minimo: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  disponible: boolean;
}
