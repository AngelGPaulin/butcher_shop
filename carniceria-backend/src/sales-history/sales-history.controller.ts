import { Controller, Get, Query, Res } from '@nestjs/common';
import { SalesHistoryService } from './sales-history.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ROLES } from 'src/auth/constants/roles.constants';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiAuth } from 'src/auth/decorators/api.decorator';
import { Response } from 'express';

@ApiAuth()
@ApiTags('Sales History')
@Controller('sales-history')
export class SalesHistoryController {
  constructor(private readonly salesHistoryService: SalesHistoryService) {}

  @ApiOperation({ summary: 'Resumen diario de ventas por sucursal (con filtros y exportación)' })
  @ApiResponse({ status: 200, description: 'Historial generado correctamente' })
  @Auth(ROLES.ADMIN)
  @Get()
  async getDailySalesSummary(
    @Res({ passthrough: true }) res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('locationId') locationId?: string,
    @Query('productId') productId?: string,
    @Query('export') exportExcel?: string,
  ) {
    const data = await this.salesHistoryService.getDailySummary({
      startDate,
      endDate,
      locationId,
      productId,
    });
  
    if (exportExcel === 'excel') {
      const buffer = await this.salesHistoryService.generateExcel(data);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=historial_ventas.xlsx');
      return res.send(buffer);
    }
  
    return data;
  }
  

  @ApiOperation({ summary: 'Resumen de ventas de hoy por sucursal' })
  @ApiResponse({ status: 200, description: 'Ventas agrupadas por sucursal hoy' })
  @Auth(ROLES.ADMIN)
  @Get('today')
  getTodaySalesSummary() {
    return this.salesHistoryService.getTodaySummary();
  }
}
