import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { FirebaseService } from '../shared/firebase.service'; // ✅ Importar

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,

    private readonly firebaseService: FirebaseService, // ✅ Inyectar
  ) {}

  async create(dto: CreateProviderDto) {
    const provider = this.providerRepository.create(dto);
    const saved = await this.providerRepository.save(provider);

    // ✅ Notificar a Firebase
    await this.firebaseService.broadcast('providers_updates', saved);

    return saved;
  }

  async findAll() {
    return this.providerRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string) {
    const provider = await this.providerRepository.findOne({
      where: { providerId: id },
    });
    if (!provider) throw new NotFoundException('Proveedor no encontrado');
    return provider;
  }

  async update(id: string, dto: UpdateProviderDto) {
    const existing = await this.findOne(id);
    const updated = this.providerRepository.merge(existing, dto);
    const saved = await this.providerRepository.save(updated);

    // ✅ Notificar a Firebase
    await this.firebaseService.broadcast('providers_updates', saved);

    return saved;
  }

  async remove(id: string) {
    const provider = await this.findOne(id);
    await this.providerRepository.remove(provider);

    // ✅ Notificar a Firebase
    await this.firebaseService.broadcast('providers_deletes', { providerId: id });

    return { message: `Proveedor con ID ${id} eliminado` };
  }
}
