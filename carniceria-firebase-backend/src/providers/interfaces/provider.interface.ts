// src/providers/interfaces/provider.interface.ts

export interface Provider {
  id?: string;
  nombre: string;
  contacto: string;
  direccion?: string;
  telefono?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
