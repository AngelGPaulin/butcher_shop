import {
    IsArray,
    IsNumber,
    IsString,
    IsUUID,
    ValidateNested,
  } from 'class-validator';
  import { ApiProperty } from '@nestjs/swagger';
  import { Type } from 'class-transformer';
  
  class SaleItemDto {
    @ApiProperty({ example: 'cfae8b7b-6a6f-41f2-b3cd-b77b1102d093' })
    @IsUUID()
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
    @ApiProperty({ example: 'f23a6d21-bf78-4bb4-a227-d72ccdb5f6e4' })
    @IsUUID()
    employeeId: string;
  
    @ApiProperty({ example: 'c7263cc4-b242-48d8-954d-7205f1f41f23' })
    @IsUUID()
    locationId: string;
  
    @ApiProperty({
      type: [SaleItemDto],
      description: 'Lista de productos vendidos',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SaleItemDto)
    items: SaleItemDto[];
  }
  