// src/products/interfaces/product.interface.ts

export interface Product {
  id?: string; // ID del documento en Firestore
  nombre: string;
  precio_por_kg: number;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  disponible: boolean;
  locationId: string;
  providerId: string;
  timestamp?: Date;
  updatedAt?: Date;
}
