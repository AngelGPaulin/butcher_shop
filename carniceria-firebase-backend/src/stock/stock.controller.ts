// src/stock/stock.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Stock')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @ApiOperation({ summary: 'Registrar entrada o salida de stock' })
  @Post()
  create(@Body() dto: CreateStockMovementDto) {
    return this.stockService.create(dto);
  }

  @ApiOperation({ summary: 'Obtener todos los movimientos de stock' })
  @Get()
  findAll() {
    return this.stockService.findAll();
  }

  @ApiOperation({ summary: 'Detalle de un movimiento de stock por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualizar movimiento de stock' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStockMovementDto) {
    return this.stockService.update(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar movimiento de stock' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockService.remove(id);
  }

  @ApiOperation({ summary: 'Stock por nombre y sucursal' })
  @Get('stock-by-name/:nombre/:locationId')
  getStockByNombreYLocation(
    @Param('nombre') nombre: string,
    @Param('locationId') locationId: string,
  ) {
    return this.stockService.getStockByNombreYLocation(nombre, locationId);
  }
}
