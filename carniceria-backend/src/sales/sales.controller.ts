import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ROLES } from 'src/auth/constants/roles.constants';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiAuth, ApiUUIDParam } from 'src/auth/decorators/api.decorator';

@ApiAuth()
@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @ApiOperation({ summary: 'Registrar una nueva venta' })
  @ApiResponse({ status: 201, description: 'Venta registrada correctamente' })
  @Auth(ROLES.EMPLOYEE, ROLES.ADMIN)
  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @ApiOperation({ summary: 'Obtener todas las ventas' })
  @ApiResponse({ status: 200, description: 'Lista de ventas' })
  @Auth(ROLES.ADMIN)
  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @ApiOperation({ summary: 'Obtener venta por ID' })
  @ApiUUIDParam('id', 'UUID de la venta')
  @ApiResponse({ status: 200, description: 'Venta encontrada' })
  @Auth(ROLES.EMPLOYEE, ROLES.ADMIN)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.salesService.findOne(id);
  }

  @ApiOperation({ summary: 'Eliminar una venta (solo admin)' })
  @ApiUUIDParam('id', 'UUID de la venta a eliminar')
  @Auth(ROLES.ADMIN)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.salesService.remove(id);
  }
  @Patch(':id/cancel')
  @Auth(ROLES.ADMIN)
  @ApiOperation({ summary: 'Anular (cancelar) una venta' })
  @ApiUUIDParam('id', 'UUID de la venta a cancelar')
  @ApiResponse({ status: 200, description: 'Venta cancelada' })
  cancel(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.salesService.cancel(id);
}

}
