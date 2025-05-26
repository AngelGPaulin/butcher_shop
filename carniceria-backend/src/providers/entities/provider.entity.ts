import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { StockMovement } from 'src/stock/entities/stock-movement.entity';

@Entity()
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  providerId: string;

  @Column('text')
  nombre: string;

  @Column('text')
  contacto: string;

  @Column('text', { nullable: true })
  direccion: string;

  @Column('text', { nullable: true })
  telefono: string;

  @OneToMany(() => Product, (product) => product.provider)
  productos: Product[];

  @OneToMany(() => StockMovement, (movement) => movement.proveedor)
  movimientos: StockMovement[];
}
