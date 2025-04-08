import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement } from './entities/stock-movement.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';
import { Product } from 'src/products/entities/product.entity';
import { Location } from 'src/locations/entities/location.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly stockRepository: Repository<StockMovement>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateStockMovementDto) {
    const product = await this.productRepository.findOne({
      where: { productId: dto.productId },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const location = await this.locationRepository.findOne({
      where: { locationId: dto.locationId },
    });
    if (!location) throw new NotFoundException('Sucursal no encontrada');

    const user = await this.userRepository.findOne({
      where: { userId: dto.userId },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const movement = this.stockRepository.create({
      tipo: dto.tipo,
      peso_kg: dto.peso_kg,
      producto: product,
      location,
      registradoPor: user,
    });

    return this.stockRepository.save(movement);
  }

  findAll() {
    return this.stockRepository.find({
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: string) {
    const movement = await this.stockRepository.findOne({
      where: { stockMovementId: id },
    });

    if (!movement) throw new NotFoundException('Movimiento no encontrado');
    return movement;
  }

  async update(id: string, dto: UpdateStockMovementDto) {
    const existing = await this.findOne(id);
    const updated = this.stockRepository.merge(existing, dto);
    return this.stockRepository.save(updated);
  }

  async remove(id: string) {
    const movement = await this.findOne(id);
    await this.stockRepository.remove(movement);
    return { message: `Movimiento con ID ${id} eliminado` };
  }
}
