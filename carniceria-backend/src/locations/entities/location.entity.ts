import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Sale } from 'src/sales/entities/sale.entity';

@Entity()
export class Location {
  @PrimaryGeneratedColumn('uuid')
  locationId: string;

  @Column('text')
  nombre: string;

  @Column('text')
  direccion: string;

  @Column('simple-array')
  coordenadas: number[];

  @OneToMany(() => User, (user) => user.location, { cascade: true })
  empleados: User[];

  @OneToMany(() => Sale, (sale) => sale.location)
  ventas: Sale[];
}
