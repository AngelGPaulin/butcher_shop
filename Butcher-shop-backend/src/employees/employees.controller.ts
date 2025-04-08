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
  import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
  import { EmployeesService } from './employees.service';
  import { CreateEmployeeDto } from './dto/create-employee.dto';
  import { UpdateEmployeeDto } from './dto/update-employee.dto';
  import { ROLES } from 'src/auth/constants/roles.constants';
  import { Auth } from 'src/auth/decorators/auth.decorator';
  import { ApiAuth, ApiUUIDParam } from 'src/auth/decorators/api.decorator';
  
  @ApiAuth()
  @ApiTags('Employees')
  @Controller('employees')
  export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) {}
  
    @ApiOperation({ summary: 'Crear un empleado' })
    @ApiResponse({ status: 201, description: 'Empleado creado exitosamente' })
    @Auth(ROLES.ADMIN)
    @Post()
    create(@Body() createEmployeeDto: CreateEmployeeDto) {
      return this.employeesService.create(createEmployeeDto);
    }
  
    @ApiOperation({ summary: 'Obtener todos los empleados' })
    @ApiResponse({ status: 200, description: 'Lista de empleados' })
    @Auth(ROLES.ADMIN)
    @Get()
    findAll() {
      return this.employeesService.findAll();
    }
  
    @ApiOperation({ summary: 'Buscar un empleado por ID' })
    @ApiUUIDParam('id', 'UUID del empleado a buscar')
    @ApiResponse({ status: 200, description: 'Empleado encontrado' })
    @Auth(ROLES.ADMIN, ROLES.EMPLOYEE)
    @Get(':id')
    findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
      return this.employeesService.findOne(id);
    }
  
    @ApiOperation({ summary: 'Actualizar un empleado por ID' })
    @ApiUUIDParam('id', 'UUID del empleado a actualizar')
    @ApiResponse({ status: 200, description: 'Empleado actualizado' })
    @Auth(ROLES.ADMIN, ROLES.EMPLOYEE)
    @Patch(':id')
    update(
      @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
      @Body() updateEmployeeDto: UpdateEmployeeDto,
    ) {
      return this.employeesService.update(id, updateEmployeeDto);
    }
  
    @ApiOperation({ summary: 'Eliminar un empleado por ID' })
    @ApiUUIDParam('id', 'UUID del empleado a eliminar')
    @ApiResponse({
      status: 200,
      description: 'Empleado eliminado',
      example: { message: 'Empleado con ID 3127d756-... eliminado' },
    })
    @Auth(ROLES.ADMIN)
    @Delete(':id')
    remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
      return this.employeesService.remove(id);
    }
  }
  