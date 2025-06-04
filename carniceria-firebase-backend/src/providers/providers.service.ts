// src/providers/providers.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../shared/firebase.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Provider } from './interfaces/provider.interface';

@Injectable()
export class ProvidersService {
  private collection;

  constructor(private readonly firebaseService: FirebaseService) {
    this.collection = this.firebaseService.getFirestore().collection('providers');
  }

  async create(dto: CreateProviderDto): Promise<Provider> {
    const data = {
      ...dto,
      createdAt: new Date(),
    };

    const docRef = await this.collection.add(data);
    const result = { id: docRef.id, ...data };

    await this.firebaseService.broadcast('providers_updates', result);
    return result;
  }

  async findAll(): Promise<Provider[]> {
    const snapshot = await this.collection.orderBy('nombre').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Provider[];
  }

  async findOne(id: string): Promise<Provider> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) throw new NotFoundException('Proveedor no encontrado');
    return { id: doc.id, ...doc.data() } as Provider;
  }

  async update(id: string, dto: UpdateProviderDto): Promise<Provider> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Proveedor no encontrado');

    await docRef.update({ ...dto, updatedAt: new Date() });
    const updated = await docRef.get();
    const result = { id: updated.id, ...updated.data() } as Provider;

    await this.firebaseService.broadcast('providers_updates', result);
    return result;
  }

  async remove(id: string): Promise<{ message: string }> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) throw new NotFoundException('Proveedor no encontrado');

    await this.collection.doc(id).delete();
    await this.firebaseService.broadcast('providers_deletes', { providerId: id });

    return { message: `Proveedor con ID ${id} eliminado` };
  }
}
