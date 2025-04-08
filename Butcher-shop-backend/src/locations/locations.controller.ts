import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
  } from '@nestjs/common';
  import { LocationsService } from './locations.service';
  import { CreateLocationDto } from './dto/create-location.dto';
  import { UpdateLocationDto } from './dto/update-location.dto';
  import { Auth } from 'src/auth/decorators/auth.decorator';
  import { ROLES } from 'src/auth/constants/roles.constants';
  import { ApiAuth, ApiUUIDParam } from 'src/auth/decorators/api.decorator';
  import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
  
  @ApiAuth()
  @ApiTags('Locations')
  @Controller('locations')
  export class LocationsController {
    constructor(private readonly locationsService: LocationsService) {}
  
    @ApiOperation({ summary: 'Crear nueva sucursal' })
    @Auth(ROLES.ADMIN)
    @Post()
    create(@Body() createLocationDto: CreateLocationDto) {
      return this.locationsService.create(createLocationDto);
    }
  
    @ApiOperation({ summary: 'Obtener todas las sucursales' })
    @Auth(ROLES.ADMIN, ROLES.EMPLOYEE)
    @Get()
    findAll() {
      return this.locationsService.findAll();
    }
  
    @ApiOperation({ summary: 'Obtener sucursal por ID' })
    @ApiUUIDParam('id', 'UUID de la sucursal')
    @Auth(ROLES.ADMIN, ROLES.EMPLOYEE)
    @Get(':id')
    findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
      return this.locationsService.findOne(id);
    }
  
    @ApiOperation({ summary: 'Actualizar sucursal por ID' })
    @ApiUUIDParam('id', 'UUID de la sucursal')
    @Auth(ROLES.ADMIN)
    @Patch(':id')
    update(
      @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
      @Body() updateLocationDto: UpdateLocationDto,
    ) {
      return this.locationsService.update(id, updateLocationDto);
    }
  
    @ApiOperation({ summary: 'Eliminar sucursal por ID' })
    @ApiUUIDParam('id', 'UUID de la sucursal')
    @Auth(ROLES.ADMIN)
    @Delete(':id')
    remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
      return this.locationsService.remove(id);
    }
  }
  