export interface Product {
  productId: string;
  nombre: string;
  precio_por_kg: number;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  disponible: boolean;
}