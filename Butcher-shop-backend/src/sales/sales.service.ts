import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Employee } from 'src/employees/entities/employee.entity';
import { Location } from 'src/locations/entities/location.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,

    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,

    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,

    @InjectRepository(Location)
    private locationRepository: Repository<Location>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    const employee = await this.employeeRepository.findOne({
      where: { employeeId: createSaleDto.employeeId },
    });
    if (!employee) throw new NotFoundException('Empleado no encontrado');

    const location = await this.locationRepository.findOne({
      where: { locationId: createSaleDto.locationId },
    });
    if (!location) throw new NotFoundException('Sucursal no encontrada');

    const sale = this.saleRepository.create({
      employee,
      location,
      items: [],
    });

    const items: SaleItem[] = [];

    for (const itemDto of createSaleDto.items) {
      const product = await this.productRepository.findOne({
        where: { productId: itemDto.productId },
      });
      if (!product) throw new NotFoundException(`Producto no encontrado`);

      const saleItem = this.saleItemRepository.create({
        product,
        peso_kg: itemDto.peso_kg,
        precio_por_kg: itemDto.precio_por_kg,
        subtotal: itemDto.subtotal,
        sale,
      });

      items.push(saleItem);
    }

    sale.items = items;

    return this.saleRepository.save(sale);
  }

  findAll() {
    return this.saleRepository.find({
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

  async update(id: string, updateSaleDto: UpdateSaleDto) {
    const existing = await this.findOne(id);
    const updated = this.saleRepository.merge(existing, updateSaleDto);
    return this.saleRepository.save(updated);
  }

  async remove(id: string) {
    const sale = await this.findOne(id);
    await this.saleRepository.remove(sale);
    return {
      message: `Venta con ID ${id} eliminada`,
    };
  }
}
