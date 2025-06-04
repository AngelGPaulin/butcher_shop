// src/auth/dto/interfaces/user.interface.ts

import { ROLES } from "src/constants/roles.constants";


export interface User {
  id?: string; // Firestore doc ID o Auth UID
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  nombre_usuario: string;
  email: string;
  contrasena?: string;
  rol: ROLES;
  locationId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
