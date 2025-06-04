// src/products/products.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from 'src/shared/firebase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './interfaces/product.interface';

@Injectable()
export class ProductsService {
  private collection;

  constructor(private readonly firebaseService: FirebaseService) {
    this.collection = this.firebaseService.getFirestore().collection('products');
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const data = {
      ...dto,
      timestamp: new Date(),
    };

    const docRef = await this.collection.add(data);
    return {
      id: docRef.id,
      ...data,
    };
  }

  async findAll(): Promise<Product[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  }

  async findOne(id: string): Promise<Product> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    return {
      id: doc.id,
      ...doc.data(),
    } as Product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) throw new NotFoundException(`Producto con ID ${id} no encontrado`);

    await docRef.update({ ...dto, updatedAt: new Date() });

    const updated = await docRef.get();
    return {
      id: updated.id,
      ...updated.data(),
    } as Product;
  }

  async remove(id: string): Promise<{ message: string }> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Producto con ID ${id} no encontrado`);

    await this.collection.doc(id).delete();

    return {
      message: `Producto con ID ${id} eliminado correctamente`,
    };
  }
}
