import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
    ParseUUIDPipe,
  } from '@nestjs/common';
  import { StockService } from './stock.service';
  import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
  import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';
  import { Auth } from 'src/auth/decorators/auth.decorator';
  import { ROLES } from 'src/auth/constants/roles.constants';
  import { ApiAuth, ApiUUIDParam } from 'src/auth/decorators/api.decorator';
  import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
  
  @ApiAuth()
  @ApiTags('Stock')
  @Controller('stock')
  export class StockController {
    constructor(private readonly stockService: StockService) {}
  
    @ApiOperation({ summary: 'Registrar entrada o salida de stock' })
    @ApiResponse({ status: 201, description: 'Movimiento registrado' })
    @Auth(ROLES.EMPLOYEE, ROLES.ADMIN)
    @Post()
    create(@Body() dto: CreateStockMovementDto) {
      return this.stockService.create(dto);
    }
  
    @ApiOperation({ summary: 'Obtener todos los movimientos de stock' })
    @ApiResponse({ status: 200, description: 'Listado de movimientos' })
    @Auth(ROLES.ADMIN)
    @Get()
    findAll() {
      return this.stockService.findAll();
    }
  
    @ApiOperation({ summary: 'Detalle de un movimiento de stock por ID' })
    @ApiUUIDParam('id', 'UUID del movimiento')
    @ApiResponse({ status: 200, description: 'Movimiento encontrado' })
    @Auth(ROLES.ADMIN)
    @Get(':id')
    findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
      return this.stockService.findOne(id);
    }
  
    @ApiOperation({ summary: 'Actualizar movimiento de stock (admin)' })
    @ApiUUIDParam('id', 'UUID del movimiento')
    @Auth(ROLES.ADMIN)
    @Patch(':id')
    update(
      @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
      @Body() dto: UpdateStockMovementDto,
    ) {
      return this.stockService.update(id, dto);
    }
  
    @ApiOperation({ summary: 'Eliminar movimiento de stock (admin)' })
    @ApiUUIDParam('id', 'UUID del movimiento')
    @Auth(ROLES.ADMIN)
    @Delete(':id')
    remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
      return this.stockService.remove(id);
    }
    @ApiOperation({ summary: 'Obtener stock actual por nombre y sucursal' })
    @Auth(ROLES.ADMIN, ROLES.EMPLOYEE)
    @Get('stock-by-name/:nombre/:locationId')
    getStockByNombreYLocation(
      @Param('nombre') nombre: string,
      @Param('locationId') locationId: string,
    ) {
      return this.stockService.getStockByNombreYLocation(nombre, locationId);
    }

  }
  