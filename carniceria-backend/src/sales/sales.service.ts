import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Location } from 'src/locations/entities/location.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/auth/entities/user.entity';
import { FirebaseService } from '../shared/firebase.service'; // ✅ Importar

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,

    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Location)
    private locationRepository: Repository<Location>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    private readonly firebaseService: FirebaseService, // ✅ Inyectar
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    const employee = await this.userRepository.findOne({
      where: { userId: createSaleDto.userId },
    });
    if (!employee) throw new NotFoundException('Empleado no encontrado');

    const location = await this.locationRepository.findOne({
      where: { locationId: createSaleDto.locationId },
    });
    if (!location) throw new NotFoundException('Sucursal no encontrada');

    const sale = this.saleRepository.create({ employee, location });
    const savedSale = await this.saleRepository.save(sale);

    const items: SaleItem[] = [];
    for (const itemDto of createSaleDto.items) {
      const product = await this.productRepository.findOne({
        where: { productId: itemDto.productId },
      });
      if (!product) throw new NotFoundException('Producto no encontrado');

      const saleItem = this.saleItemRepository.create({
        product,
        peso_kg: itemDto.peso_kg,
        precio_por_kg: itemDto.precio_por_kg,
        subtotal: itemDto.subtotal,
        sale: savedSale,
      });

      items.push(saleItem);
    }

    await this.saleItemRepository.save(items);

    const final = await this.saleRepository.findOne({
      where: { saleId: savedSale.saleId },
      relations: ['employee', 'location', 'items', 'items.product'],
    });

    // ✅ Emitir evento en tiempo real
    await this.firebaseService.broadcast('sales_updates', {
      saleId: final?.saleId,
      location: final?.location?.nombre || '',
      employee: final?.employee?.nombre || '',
      total: final?.items.reduce((sum, i) => sum + i.subtotal, 0),
      timestamp: new Date().toISOString(),
    });

    return final;
  }

  async findAll() {
    return this.saleRepository.find({
      where: { cancelada: false },
      relations: ['employee', 'location', 'items', 'items.product'],
    });
  }

  async findOne(id: string) {
    const sale = await this.saleRepository.findOne({
      where: { saleId: id },
      relations: ['employee', 'location', 'items', 'items.product'],
    });

    if (!sale) throw new NotFoundException('Venta no encontrada');
    return sale;
  }

  async cancel(id: string) {
    const sale = await this.findOne(id);
    if (sale.cancelada) {
      return { message: 'Esta venta ya está cancelada.' };
    }

    sale.cancelada = true;
    await this.saleRepository.save(sale);

    // ✅ Notificar cancelación
    await this.firebaseService.broadcast('sales_cancels', {
      saleId: id,
      cancelada: true,
      timestamp: new Date().toISOString(),
    });

    return {
      message: `Venta con ID ${id} cancelada.`,
    };
  }

  async remove(id: string) {
    const sale = await this.findOne(id);
    await this.saleRepository.remove(sale);

    // ✅ Notificar eliminación
    await this.firebaseService.broadcast('sales_deletes', {
      saleId: id,
    });

    return {
      message: `Venta con ID ${id} eliminada`,
    };
  }
}
