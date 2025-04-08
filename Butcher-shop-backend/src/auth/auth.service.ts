import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { User } from './entities/user.entity';
import { Employee } from 'src/employees/entities/employee.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ROLES } from './constants/roles.constants';
import { TOKEN_NAME } from './constants/jwt.constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    private readonly jwtService: JwtService,
  ) {}

  async registerEmployee(employeeId: string, createUserDto: CreateUserDto) {
    if (createUserDto.rol === ROLES.ADMIN) {
      throw new UnauthorizedException('No puedes registrar un Admin con este método');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.contrasena, 10);

    const newUser = this.userRepository.create({
      ...createUserDto,
      contrasena: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);

    const employee = await this.employeeRepository.preload({ employeeId });
    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${employeeId} no encontrado`);
    }

    employee.user = savedUser;
    return this.employeeRepository.save(employee);
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { nombre_usuario: loginUserDto.nombre_usuario },
    });

    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.contrasena,
      user.contrasena,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const payload = {
      userId: user.userId,
      nombre_usuario: user.nombre_usuario,
      rol: user.rol,
    };

    const token = this.jwtService.sign(payload);

    return {
      [TOKEN_NAME]: token,
      user: payload,
    };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.contrasena) {
      updateUserDto.contrasena = bcrypt.hashSync(updateUserDto.contrasena, 10);
    }
    const newUserData = await this.userRepository.preload({
      userId: id,
      ...updateUserDto,
    });
  
    if (!newUserData) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  
    await this.userRepository.save(newUserData);
  
    return newUserData;
  }
  
}
