import { Product } from 'src/products/entities/product.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

// Crear producto
export function ApiCreateProduct() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear un nuevo producto' }),
    ApiResponse({
      status: 201,
      description: 'Producto creado exitosamente',
      example: {
        productId: '9f2c5d10-7c1a-4c45-92e1-a7f2b93491ff',
        nombre: 'Carne de res',
        precio_por_kg: 120.5,
        unidad_medida: 'kg',
        stock_actual: 30,
        stock_minimo: 5,
        disponible: true,
      } as Product,
    }),
  );
}

// Obtener todos los productos
export function ApiFindAllProducts() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar todos los productos' }),
    ApiResponse({
      status: 200,
      description: 'Listado de productos obtenido exitosamente',
      example: [
        {
          productId: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
          nombre: 'Carne de cerdo',
          precio_por_kg: 98.75,
          unidad_medida: 'kg',
          stock_actual: 15,
          stock_minimo: 3,
          disponible: true,
        },
        {
          productId: 'b2c3d4e5-6789-01bc-def1-2345678901bc',
          nombre: 'Pollo',
          precio_por_kg: 75.0,
          unidad_medida: 'kg',
          stock_actual: 40,
          stock_minimo: 10,
          disponible: true,
        },
      ] as Product[],
    }),
    ApiResponse({
      status: 404,
      description: 'No se encontraron productos',
    }),
  );
}

// Obtener producto por ID
export function ApiProductResponse() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener un producto por ID' }),
    ApiResponse({
      status: 200,
      description: 'Producto obtenido exitosamente',
      example: {
        productId: '9f2c5d10-7c1a-4c45-92e1-a7f2b93491ff',
        nombre: 'Chorizo',
        precio_por_kg: 95,
        unidad_medida: 'kg',
        stock_actual: 12,
        stock_minimo: 5,
        disponible: true,
      } as Product,
    }),
    ApiResponse({
      status: 404,
      description: 'Producto no encontrado',
    }),
  );
}
