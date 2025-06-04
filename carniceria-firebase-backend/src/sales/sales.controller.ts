import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  NotImplementedException,
  StreamableFile,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @ApiOperation({ summary: 'Registrar una nueva venta' })
  @Post()
  create(@Body() dto: CreateSaleDto) {
    return this.salesService.create(dto);
  }

  @ApiOperation({ summary: 'Obtener todas las ventas' })
  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @ApiOperation({ summary: 'Historial de ventas filtrado (con exportación)' })
  @Get('/history')
  async getHistory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('locationId') locationId?: string,
    @Query('userId') userId?: string,
    @Query('export') exportType?: string
  ) {
    const result = await this.salesService.getSalesHistory(
      startDate,
      endDate,
      locationId,
      userId
    );

    if (exportType === 'excel') {
      const file = await this.salesService.exportToExcel(result);
      return new StreamableFile(file.buffer, {
        type: file.mimeType,
        disposition: 'attachment; filename=reporte.xlsx',
      });
    }

    if (exportType === 'pdf') {
      throw new NotImplementedException('Exportación a PDF no implementada');
    }

    return result; // ✅ Esto devuelve JSON correctamente
  }

  @ApiOperation({ summary: 'Obtener venta por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @ApiOperation({ summary: 'Eliminar una venta' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }

  @ApiOperation({ summary: 'Cancelar una venta' })
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.salesService.cancel(id);
  }
}
