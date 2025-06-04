// src/locations/interfaces/location.interface.ts

export interface Location {
  nombre: string;
  direccion: string;
  coordenadas: number[];
  timestamp?: Date; // se agrega al crear
  updatedAt?: Date; // opcional para actualizaciones
}
