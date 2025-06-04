// src/stock/interfaces/stock-movement.interface.ts

export interface StockMovement {
  id?: string;
  tipo: 'entrada' | 'salida';
  peso_kg: number;
  fecha: Date;
  productId: string;
  locationId: string;
  userId: string;
}
