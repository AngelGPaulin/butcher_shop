// src/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../shared/firebase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TOKEN_NAME } from '../constants/jwt.constants';
import { LoginUserDto } from './dto/login.dto';
import { User } from './interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async registerUser(dto: CreateUserDto) {
    const { contrasena, email, ...rest } = dto;

    const auth = this.firebaseService.getAuth();
    const firestore = this.firebaseService.getFirestore();

    // Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password: contrasena,
      displayName: `${dto.nombre} ${dto.apellido}`,
    });

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Firestore
    const userData = {
      ...rest,
      email,
      contrasena: hashedPassword,
      createdAt: new Date(),
    };

    await firestore.collection('users').doc(userRecord.uid).set(userData);

    return {
      uid: userRecord.uid,
      ...userData,
    };
  }

async loginUser(dto: LoginUserDto) {
  const user = await this.firebaseService.findByEmail('users', dto.email) as User;

  if (!user) throw new UnauthorizedException('Usuario no encontrado');

  const isPasswordValid = await bcrypt.compare(dto.contrasena, user.contrasena);
  if (!isPasswordValid) {
    throw new UnauthorizedException('Contraseña incorrecta');
  }

  const payload = {
    userId: user.id,
    email: user.email,
    rol: user.rol,
  };

  // 🔐 Mostrar la clave usada para firmar
  console.log("🔐 JWT_KEY usada:", process.env.JWT_KEY);

  const token = this.jwtService.sign(payload, {
    secret: process.env.JWT_KEY,
    expiresIn: '7d',
  });

  return {
    [TOKEN_NAME]: token,
    user: payload,
  };
}

async loginWithFirebase(email: string) {
  const user = await this.firebaseService.findByEmail('users', email) as User;

  if (!user) throw new UnauthorizedException('Usuario no registrado');

  const payload = {
    userId: user.id,
    email: user.email,
    rol: user.rol,
  };

  // 🔐 Mostrar la clave usada para firmar
  console.log("🔐 JWT_KEY usada:", process.env.JWT_KEY);

  const token = this.jwtService.sign(payload, {
    secret: process.env.JWT_KEY,
    expiresIn: '7d',
  });

  return {
    [TOKEN_NAME]: token,
    user: payload,
  };
}


  async updateUser(id: string, dto: UpdateUserDto) {
    const firestore = this.firebaseService.getFirestore();
    const docRef = firestore.collection('users').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (dto.contrasena) {
      dto.contrasena = await bcrypt.hash(dto.contrasena, 10);
    }

    await docRef.update({ ...dto, updatedAt: new Date() });

    return {
      id,
      ...(await docRef.get()).data(),
    };
  }

  async findAll(): Promise<User[]> {
    const snapshot = await this.firebaseService.getFirestore().collection('users').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  }

  async remove(id: string) {
    const docRef = this.firebaseService.getFirestore().collection('users').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

    await docRef.delete();

    return {
      message: `Usuario con ID ${id} eliminado`,
    };
  }
}
