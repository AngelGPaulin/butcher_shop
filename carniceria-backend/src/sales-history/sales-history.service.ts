import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sale } from 'src/sales/entities/sale.entity';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';

interface SalesHistoryFilters {
  startDate?: string;
  endDate?: string;
  locationId?: string;
  productId?: string;
}

@Injectable()
export class SalesHistoryService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async getDailySummary(filters: SalesHistoryFilters) {
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.location', 'location')
      .leftJoin('sale.items', 'item')
      .select('DATE(sale.fecha)', 'fecha')
      .addSelect('location.locationId', 'locationId')
      .addSelect('location.nombre', 'nombre')
      .addSelect('SUM(item.subtotal)', 'total_ventas')
      .addSelect('SUM(item.peso_kg)', 'total_kg')
      .addSelect('COUNT(item.saleItemId)', 'total_items')
      .groupBy('fecha')
      .addGroupBy('location.locationId')
      .addGroupBy('location.nombre')
      .orderBy('fecha', 'DESC');

    if (filters.startDate) {
      query.andWhere('sale.fecha >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('sale.fecha <= :endDate', { endDate: filters.endDate });
    }

    if (filters.locationId) {
      query.andWhere('location.locationId = :locationId', {
        locationId: filters.locationId,
      });
    }

    if (filters.productId) {
      query.andWhere('item.product = :productId', {
        productId: filters.productId,
      });
    }

    const result = await query.getRawMany();

    return result.map((row) => ({
      fecha: row.fecha,
      location: {
        locationId: row.locationId,
        nombre: row.nombre,
      },
      total_ventas: parseFloat(row.total_ventas),
      total_kg: parseFloat(row.total_kg),
      total_items: parseInt(row.total_items),
    }));
  }

  async getTodaySummary() {
    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.location', 'location')
      .leftJoin('sale.items', 'item')
      .select('DATE(sale.fecha)', 'fecha')
      .addSelect('location.locationId', 'locationId')
      .addSelect('location.nombre', 'nombre')
      .addSelect('SUM(item.subtotal)', 'total_ventas')
      .addSelect('SUM(item.peso_kg)', 'total_kg')
      .addSelect('COUNT(item.saleItemId)', 'total_items')
      .where('DATE(sale.fecha) = CURRENT_DATE')
      .groupBy('fecha')
      .addGroupBy('location.locationId')
      .addGroupBy('location.nombre')
      .orderBy('fecha', 'DESC')
      .getRawMany();

    return result.map((row) => ({
      fecha: row.fecha,
      location: {
        locationId: row.locationId,
        nombre: row.nombre,
      },
      total_ventas: parseFloat(row.total_ventas),
      total_kg: parseFloat(row.total_kg),
      total_items: parseInt(row.total_items),
    }));
  }

  async generateExcel(data: any[]) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Historial Ventas');

    sheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Sucursal', key: 'sucursal', width: 30 },
      { header: 'Total Ventas ($)', key: 'total_ventas', width: 20 },
      { header: 'Total Kg', key: 'total_kg', width: 15 },
      { header: 'Total Productos', key: 'total_items', width: 20 },
    ];

    data.forEach((row) => {
      sheet.addRow({
        fecha: row.fecha,
        sucursal: row.location.nombre,
        total_ventas: row.total_ventas,
        total_kg: row.total_kg,
        total_items: row.total_items,
      });
    });

    return workbook.xlsx.writeBuffer();
  }
}
