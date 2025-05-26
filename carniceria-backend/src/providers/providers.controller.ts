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
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ROLES } from 'src/auth/constants/roles.constants';
import { ApiAuth, ApiUUIDParam } from 'src/auth/decorators/api.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiAuth()
@ApiTags('Proveedores')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @ApiOperation({ summary: 'Crear nuevo proveedor' })
  @ApiResponse({ status: 201, description: 'Proveedor creado' })
  @Auth(ROLES.ADMIN)
  @Post()
  create(@Body() dto: CreateProviderDto) {
    return this.providersService.create(dto);
  }

  @ApiOperation({ summary: 'Listar todos los proveedores' })
  @ApiResponse({ status: 200, description: 'Listado de proveedores' })
  @Auth(ROLES.ADMIN)
  @Get()
  findAll() {
    return this.providersService.findAll();
  }

  @ApiOperation({ summary: 'Obtener proveedor por ID' })
  @ApiUUIDParam('id', 'UUID del proveedor')
  @ApiResponse({ status: 200, description: 'Proveedor encontrado' })
  @Auth(ROLES.ADMIN)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.providersService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualizar proveedor' })
  @ApiUUIDParam('id', 'UUID del proveedor')
  @Auth(ROLES.ADMIN)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateProviderDto,
  ) {
    return this.providersService.update(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar proveedor' })
  @ApiUUIDParam('id', 'UUID del proveedor')
  @Auth(ROLES.ADMIN)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.providersService.remove(id);
  }
}
