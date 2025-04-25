import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
  } from '@nestjs/common';
  import { ProductsService } from './products.service';
  import { CreateProductDto } from './dto/create-product.dto';
  import { UpdateProductDto } from './dto/update-product.dto';
  import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
  import { Auth } from 'src/auth/decorators/auth.decorator';
  import { ROLES } from 'src/auth/constants/roles.constants';
  import { ApiAuth, ApiUUIDParam } from 'src/auth/decorators/api.decorator';
  import {
    ApiCreateProduct,
    ApiFindAllProducts,
    ApiProductResponse,
  } from 'src/decorators/products.decorator';
  
  @ApiAuth()
  @ApiTags('Products')
  @Controller('products')
  export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}
  
    @ApiCreateProduct()
    @Auth(ROLES.EMPLOYEE, ROLES.ADMIN)
    @Post()
    create(@Body() createProductDto: CreateProductDto) {
      return this.productsService.create(createProductDto);
    }
  
    @ApiFindAllProducts()
    @Auth(ROLES.EMPLOYEE, ROLES.ADMIN)
    @Get()
    findAll() {
      return this.productsService.findAll();
    }
  
    @ApiProductResponse()
    @ApiUUIDParam('productId', 'UUID del producto a buscar')
    @Auth(ROLES.EMPLOYEE, ROLES.ADMIN)
    @Get(':productId')
    findOne(
      @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    ) {
      return this.productsService.findOne(productId);
    }
  
    @ApiOperation({ summary: 'Actualizar datos de un producto' })
    @ApiUUIDParam('productId', 'UUID del producto a actualizar')
    @ApiProductResponse()
    @Auth(ROLES.EMPLOYEE, ROLES.ADMIN)
    @Patch(':productId')
    update(
      @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
      @Body() updateProductDto: UpdateProductDto,
    ) {
      return this.productsService.update(productId, updateProductDto);
    }
  
    @ApiOperation({ summary: 'Eliminar un producto' })
    @ApiUUIDParam('productId', 'UUID del producto a eliminar')
    @ApiResponse({
      status: 200,
      description: 'Producto eliminado',
      example: {
        message: 'Producto con ID 3127d756-65ee-4ba8-819e-62f12ce4dc20 eliminado correctamente',
      },
    })
    @Auth(ROLES.EMPLOYEE, ROLES.ADMIN)
    @Delete(':productId')
    remove(
      @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    ) {
      return this.productsService.remove(productId);
    }
  }
  