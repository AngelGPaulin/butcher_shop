import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const employee = this.employeeRepository.create(createEmployeeDto);
    return this.employeeRepository.save(employee);
  }

  findAll() {
    return this.employeeRepository.find({
      relations: { user: true }, // eliminar si no necesitas cargar usuario
    });
  }

  async findOne(id: string) {
    const employee = await this.employeeRepository.findOne({
      where: { employeeId: id },
      relations: { user: true }, // eliminar si no necesitas cargar usuario
    });

    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employeeToUpdate = await this.employeeRepository.preload({
      employeeId: id,
      ...updateEmployeeDto,
    });

    if (!employeeToUpdate) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    return this.employeeRepository.save(employeeToUpdate);
  }

  async remove(id: string) {
    await this.findOne(id); // lanza error si no existe
    await this.employeeRepository.delete({ employeeId: id });
    return {
      message: `Empleado con ID ${id} eliminado`,
    };
  }
}
