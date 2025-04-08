import { IsArray, ArrayNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({
    example: 'Sucursal Centro',
    description: 'Nombre de la sucursal',
  })
  @IsString()
  @MaxLength(35)
  nombre: string;

  @ApiProperty({
    example: 'Av. Siempre Viva 742, Ciudad',
    description: 'Dirección física de la sucursal',
  })
  @IsString()
  @MaxLength(160)
  direccion: string;

  @ApiProperty({
    example: [19.4326, -99.1332],
    description: 'Coordenadas GPS [latitud, longitud]',
  })
  @IsArray()
  @ArrayNotEmpty()
  coordenadas: number[];
}
