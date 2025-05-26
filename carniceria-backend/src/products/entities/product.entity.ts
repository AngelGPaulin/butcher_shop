import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Location } from 'src/locations/entities/location.entity';
import { Provider } from 'src/providers/entities/provider.entity';

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

  @Column()
  locationId: string;

  @ManyToOne(() => Location, location => location.ventas, { nullable: false })
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @Column({ nullable: true })
  providerId: string;

  @ManyToOne(() => Provider, (provider) => provider.productos, { nullable: true })
  @JoinColumn({ name: 'providerId' })
  provider: Provider;
}
