import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ROLES } from '../constants/roles.constants';
import { Location } from 'src/locations/entities/location.entity';
import { Sale } from 'src/sales/entities/sale.entity';

@Entity()
export class User {
  @ApiProperty({ example: '0f45a47e-1b21-4d8a-a36a-9a3896b88f14' })
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @ApiProperty({ example: 'Carlos' })
  @Column('text')
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @Column('text')
  apellido: string;

  @ApiProperty({ example: '1234567890' })
  @Column('text')
  telefono: string;

  @ApiProperty({ example: 'Calle Falsa 123' })
  @Column('text')
  direccion: string;

  @ApiProperty({ example: 'carlosp' })
  @Column('text', { unique: true })
  nombre_usuario: string;

  @ApiProperty({ example: 'hashedpassword123' })
  @Column('text')
  contrasena: string;

  @ApiProperty({ enum: ROLES, example: ROLES.EMPLOYEE })
  @Column({ type: 'enum', enum: ROLES })
  rol: ROLES;

  @ApiProperty({ type: () => Location })
  @ManyToOne(() => Location, (location) => location.empleados, { eager: true })
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @ApiProperty({ type: () => [Sale] })
  @OneToMany(() => Sale, (sale) => sale.employee)
  ventas: Sale[];
}
