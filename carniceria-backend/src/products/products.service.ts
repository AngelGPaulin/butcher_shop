import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(productId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { productId },
    });
    if (!product) throw new NotFoundException(`Producto con ID ${productId} no encontrado`);
    return product;
  }

  async update(productId: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const productToUpdate = await this.productRepository.preload({
      productId,
      ...updateProductDto,
    });
    if (!productToUpdate) throw new NotFoundException(`Producto con ID ${productId} no encontrado`);
    await this.productRepository.save(productToUpdate);
    return productToUpdate;
  }

  async remove(productId: string): Promise<{ message: string }> {
    const product = await this.findOne(productId);
    await this.productRepository.delete({ productId });
    return {
      message: `Producto con ID ${productId} eliminado correctamente`,
    };
  }
}
