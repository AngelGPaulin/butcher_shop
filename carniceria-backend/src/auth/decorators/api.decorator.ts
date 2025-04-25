import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiParam } from '@nestjs/swagger';


export const ApiAuth = () => {
  return applyDecorators(
    ApiResponse({
      status: 401,
      description: 'Token faltante o inválido',
    }),
    ApiResponse({
      status: 403,
      description: 'El usuario no tiene el rol necesario',
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    }),
  );
};


export function ApiUUIDParam(name: string, description: string) {
  return ApiParam({
    name,
    description,
    type: 'string',
    format: 'uuid',
  });
}
