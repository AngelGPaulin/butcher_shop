import { IsEnum, IsNumber, IsString} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStockMovementDto {
  @ApiProperty({
    example: 'entrada',
    enum: ['entrada', 'salida'],
    description: 'Tipo de movimiento: entrada o salida',
  })
  @IsEnum(['entrada', 'salida'])
  tipo: 'entrada' | 'salida';

  @ApiProperty({
    example: 12.5,
    description: 'Peso en kilogramos del producto',
  })
  @IsNumber()
  peso_kg: number;

  @ApiProperty({
    example: 'f2e61255-330d-41d1-b4bb-e282ab2c2d4b',
    description: 'ID del producto',
  })
  @IsString()

  productId: string;

  @ApiProperty({
    example: 'b3d21026-097f-4cfd-87e5-47232c2ea099',
    description: 'ID de la sucursal',
  })
  @IsString()

  locationId: string;

  @ApiProperty({
    example: '3ac7480f-937f-4c25-b279-f3de57b54038',
    description: 'ID del usuario que registra el movimiento',
  })
  @IsString()

  userId: string;
}
