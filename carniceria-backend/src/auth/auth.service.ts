import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from './entities/user.entity';
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

    private readonly jwtService: JwtService,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const { contrasena, locationId, ...rest } = createUserDto;

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const newUser = this.userRepository.create({
      ...rest,
      contrasena: hashedPassword,
      location: { locationId },
    });

    return this.userRepository.save(newUser);
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
      updateUserDto.contrasena = await bcrypt.hash(updateUserDto.contrasena, 10);
    }

    const updated = await this.userRepository.preload({
      userId: id,
      ...updateUserDto,
    });

    if (!updated) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.userRepository.save(updated);
  }
  async findAll() {
  return this.userRepository.find({
    select: ['userId', 'nombre', 'apellido', 'nombre_usuario', 'rol'],
  });
}

}
