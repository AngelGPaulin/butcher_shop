import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  productId: string;

  @Column()
  nombre: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio_por_kg: number;

  @Column()
  unidad_medida: string;

  @Column('decimal', { precision: 10, scale: 2 })
  stock_actual: number;

  @Column('decimal', { precision: 10, scale: 2 })
  stock_minimo: number;

  @Column({ default: true })
  disponible: boolean;
}
