import {
  IsArray,
  IsNumber,
  IsString,

  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class SaleItemDto {
  @ApiProperty({ example: 'cfae8b7b-6a6f-41f2-b3cd-b77b1102d093' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  peso_kg: number;

  @ApiProperty({ example: 90.0 })
  @IsNumber()
  precio_por_kg: number;

  @ApiProperty({ example: 225.0 })
  @IsNumber()
  subtotal: number;
}

export class CreateSaleDto {
  @ApiProperty({
    example: 'f23a6d21-bf78-4bb4-a227-d72ccdb5f6e4',
    description: 'ID del usuario (empleado) que realiza la venta',
  })
  @IsString()

  userId: string;

  @ApiProperty({
    example: 'c7263cc4-b242-48d8-954d-7205f1f41f23',
    description: 'ID de la sucursal donde se realiza la venta',
  })
  @IsString()
  locationId: string;

  @ApiProperty({
    type: [SaleItemDto],
    description: 'Lista de productos vendidos con peso y precio',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
