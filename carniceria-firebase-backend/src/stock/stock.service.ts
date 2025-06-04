// src/stock/stock.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';
import { FirebaseService } from '../shared/firebase.service';
import { StockMovement } from './interfaces/stock-movement.interface';

@Injectable()
export class StockService {
  private collection;

  constructor(private readonly firebaseService: FirebaseService) {
    this.collection = this.firebaseService.getFirestore().collection('stock_movements');
  }

  async create(dto: CreateStockMovementDto): Promise<StockMovement> {
    const data: StockMovement = {
      ...dto,
      fecha: new Date(),
    };

    const docRef = await this.collection.add(data);
    const result = { id: docRef.id, ...data };

    await this.firebaseService.broadcast('stock_movements', result);
    return result;
  }

  async findAll(): Promise<StockMovement[]> {
    const snapshot = await this.collection.orderBy('fecha', 'desc').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StockMovement[];
  }

  async findOne(id: string): Promise<StockMovement> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) throw new NotFoundException('Movimiento no encontrado');
    return { id: doc.id, ...doc.data() } as StockMovement;
  }

  async update(id: string, dto: UpdateStockMovementDto): Promise<StockMovement> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) throw new NotFoundException('Movimiento no encontrado');

    await docRef.update({ ...dto });
    const updated = await docRef.get();

    const result = { id: updated.id, ...updated.data() } as StockMovement;
    await this.firebaseService.broadcast('stock_movements', { ...result, updated: true });
    return result;
  }

  async remove(id: string): Promise<{ message: string }> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) throw new NotFoundException('Movimiento no encontrado');

    await this.collection.doc(id).delete();

    await this.firebaseService.broadcast('stock_movements_deletes', {
      movementId: id,
      deleted: true,
    });

    return { message: `Movimiento con ID ${id} eliminado` };
  }

  async getStockByNombreYLocation(nombre: string, locationId: string) {
    // Buscar todos los productos por nombre desde la colección de productos
    const productsSnap = await this.firebaseService.getFirestore()
      .collection('products')
      .where('nombre', '==', nombre)
      .get();

    if (productsSnap.empty) throw new NotFoundException('Producto no encontrado');

    const productId = productsSnap.docs[0].id;

    const stockSnapshot = await this.collection
      .where('productId', '==', productId)
      .where('locationId', '==', locationId)
      .get();

    const total = stockSnapshot.docs.reduce((sum, doc) => {
      const { tipo, peso_kg } = doc.data();
      return tipo === 'entrada' ? sum + peso_kg : sum - peso_kg;
    }, 0);

    return { stock_actual: total };
  }
}
