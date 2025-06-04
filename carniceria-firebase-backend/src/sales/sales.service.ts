import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { FirebaseService } from '../shared/firebase.service';
import { Sale } from './interfaces/sale.interface';
import * as ExcelJS from 'exceljs';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class SalesService {
  private salesCollection;
  private locationsCollection;
  private usersCollection;

  constructor(private readonly firebaseService: FirebaseService) {
    const firestore = this.firebaseService.getFirestore();
    this.salesCollection = firestore.collection('sales');
    this.locationsCollection = firestore.collection('locations');
    this.usersCollection = firestore.collection('users');
  }

  async create(dto: CreateSaleDto): Promise<Sale> {
    const plainItems = dto.items.map((item) => ({
      productId: item.productId,
      peso_kg: item.peso_kg,
      precio_por_kg: item.precio_por_kg,
      subtotal: item.subtotal,
    }));

    const data: Sale = {
      userId: dto.userId,
      locationId: dto.locationId,
      items: plainItems,
      cancelada: false,
      fecha: Timestamp.now(),
    };

    const docRef = await this.salesCollection.add(data);

    return {
      id: docRef.id,
      ...data,
    };
  }

  async findAll(): Promise<Sale[]> {
    const snapshot = await this.salesCollection.where('cancelada', '==', false).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Sale[];
  }

  async findOne(id: string): Promise<Sale> {
    const doc = await this.salesCollection.doc(id).get();
    if (!doc.exists) throw new NotFoundException('Venta no encontrada');
    return { id: doc.id, ...doc.data() } as Sale;
  }

  async cancel(id: string): Promise<{ message: string }> {
    const docRef = this.salesCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Venta no encontrada');

    const sale = doc.data() as Sale;
    if (sale.cancelada) {
      return { message: 'Esta venta ya está cancelada.' };
    }

    await docRef.update({ cancelada: true });

    await this.firebaseService.broadcast('sales_cancels', {
      saleId: id,
      cancelada: true,
      timestamp: new Date().toISOString(),
    });

    return { message: `Venta con ID ${id} cancelada.` };
  }

  async remove(id: string): Promise<{ message: string }> {
    const doc = await this.salesCollection.doc(id).get();
    if (!doc.exists) throw new NotFoundException('Venta no encontrada');

    await this.salesCollection.doc(id).delete();

    await this.firebaseService.broadcast('sales_deletes', {
      saleId: id,
    });

    return { message: `Venta con ID ${id} eliminada` };
  }

  async getSalesHistory(
    startDate: string,
    endDate: string,
    locationId?: string,
    userId?: string
  ): Promise<any[]> {
    const start = Timestamp.fromDate(new Date(startDate));
    const end = Timestamp.fromDate(new Date(endDate));

    let query = this.salesCollection
      .where('cancelada', '==', false)
      .where('fecha', '>=', start)
      .where('fecha', '<=', end);

    if (locationId) {
      query = query.where('locationId', '==', locationId);
    }

    if (userId) {
      query = query.where('userId', '==', userId);
    }

    const snapshot = await query.get();

    const salesPromises = snapshot.docs.map(async (doc) => {
      const saleData = doc.data() as Sale;

      let locationName = '-';
      if (saleData.locationId) {
        const locationDoc = await this.locationsCollection.doc(saleData.locationId).get();
        if (locationDoc.exists) {
          locationName = locationDoc.data().nombre || '-';
        }
      }

      let employeeName = '-';
      let employeeLastName = '';
      if (saleData.userId) {
        const userDoc = await this.usersCollection.doc(saleData.userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          employeeName = userData.nombre || '-';
          employeeLastName = userData.apellido || '';
        }
      }

      const totalVentas = saleData.items.reduce((sum, item) => sum + item.subtotal, 0);
      const totalKg = saleData.items.reduce((sum, item) => sum + item.peso_kg, 0);
      const totalItems = saleData.items.length;

      return {
        fecha: saleData.fecha,
        location: { nombre: locationName },
        employee: { nombre: employeeName, apellido: employeeLastName },
        total_ventas: totalVentas,
        total_kg: totalKg,
        total_items: totalItems,
      };
    });

    return Promise.all(salesPromises);
  }

  async exportToExcel(data: any[]): Promise<{ buffer: Buffer; mimeType: string }> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Ventas');

    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Sucursal', key: 'sucursal', width: 25 },
      { header: 'Empleado', key: 'empleado', width: 25 },
      { header: 'Total $', key: 'total', width: 15 },
      { header: 'Total Kg', key: 'total_kg', width: 15 },
      { header: 'Items', key: 'items_count', width: 10 },
    ];

    for (const venta of data) {
      worksheet.addRow({
        fecha:
          venta.fecha instanceof Timestamp
            ? venta.fecha.toDate().toLocaleDateString()
            : new Date(venta.fecha).toLocaleDateString(),
        sucursal: venta.location.nombre,
        empleado: `${venta.employee.nombre} ${venta.employee.apellido}`.trim(),
        total: venta.total_ventas,
        total_kg: venta.total_kg,
        items_count: venta.total_items,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(buffer),
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}
