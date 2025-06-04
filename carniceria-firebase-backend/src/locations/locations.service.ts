import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from 'src/shared/firebase.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  private collection;

  constructor(private readonly firebaseService: FirebaseService) {
    this.collection = this.firebaseService.getFirestore().collection('locations');
  }

  async create(dto: CreateLocationDto) {
    const data = { ...dto, timestamp: new Date() };
    const docRef = await this.collection.add(data);
    return { id: docRef.id, ...data };
  }

  async findAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async findOne(id: string) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Location with ID ${id} not found`);
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, dto: UpdateLocationDto) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException(`Location with ID ${id} not found`);

    await docRef.update({ ...dto, updatedAt: new Date() });
    return { id, ...(await docRef.get()).data() };
  }

  async remove(id: string) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Location with ID ${id} not found`);

    await this.collection.doc(id).delete();
    return { message: `Location with ID ${id} deleted` };
  }
}
