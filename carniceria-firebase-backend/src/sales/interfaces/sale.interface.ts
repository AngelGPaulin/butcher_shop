// src/sales/interfaces/sale.interface.ts

import { Timestamp } from "firebase-admin/firestore";

export interface SaleItem {
  productId: string;
  peso_kg: number;
  precio_por_kg: number;
  subtotal: number;
}

export interface Sale {
  id?: string;
  userId: string;
  locationId: string;
  items: SaleItem[];
  fecha: Date | Timestamp; 
  cancelada: boolean;
}
export interface SalesHistoryRow {
  fecha: Timestamp; // O Date, si lo conviertes aquí
  location: { nombre: string };
  employee: { nombre: string; apellido: string };
  total_ventas: number;
  total_kg: number;
  total_items: number;
}