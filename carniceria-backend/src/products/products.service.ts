import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FirebaseService } from '../shared/firebase.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);
    const saved = await this.productRepository.save(product);
    await this.firebaseService.broadcast('products_updates', saved);
    return saved;
  }

  async findAll() {
    return this.productRepository.find();
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({ productId: id });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      productId: id,
      ...updateProductDto,
    });
    if (!product) throw new NotFoundException('Product not found');

    const saved = await this.productRepository.save(product);
    await this.firebaseService.broadcast('products_updates', saved);
    return saved;
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    await this.firebaseService.broadcast('products_deletes', { productId: id });

    return {
      message: `Product with ID ${id} deleted`,
    };
  }
}
