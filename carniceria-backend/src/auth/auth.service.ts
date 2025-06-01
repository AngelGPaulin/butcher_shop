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

import { FirebaseService } from '../shared/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const { contrasena, locationId, email, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const newUser = this.userRepository.create({
      ...rest,
      email,
      contrasena: hashedPassword,
      location: { locationId },
    });

    const saved = await this.userRepository.save(newUser);

    // ✅ Crear en Firebase Auth
    await this.firebaseService.createFirebaseUser(email, contrasena);

    // ✅ Firebase Firestore
    await this.firebaseService.broadcast('users_updates', {
      userId: saved.userId,
      nombre_usuario: saved.nombre_usuario,
      email: saved.email,
      rol: saved.rol,
      nombre: saved.nombre,
      apellido: saved.apellido,
    });

    return saved;
  }

async loginUser(loginUserDto: LoginUserDto) {
  const user = await this.userRepository.findOne({
    where: { email: loginUserDto.email },
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
    email: user.email,
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

    const saved = await this.userRepository.save(updated);

    await this.firebaseService.broadcast('users_updates', {
      userId: saved.userId,
      nombre_usuario: saved.nombre_usuario,
      email: saved.email,
      rol: saved.rol,
      nombre: saved.nombre,
      apellido: saved.apellido,
    });

    return saved;
  }

  async findAll() {
    return this.userRepository.find({
      select: ['userId', 'nombre', 'apellido', 'nombre_usuario', 'email', 'rol'],
    });
  }

async loginWithFirebase(email: string) {
  const user = await this.userRepository.findOne({
    where: { email },
  });

  if (!user) throw new UnauthorizedException('Usuario no registrado en el sistema');

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

}
