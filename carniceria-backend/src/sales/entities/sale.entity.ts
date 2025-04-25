import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  Column,
} from 'typeorm';
import { Location } from 'src/locations/entities/location.entity';
import { SaleItem } from './sale-item.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/entities/user.entity';

@Entity()
export class Sale {
  @ApiProperty({ example: 'dc42147d-5e13-4a8d-bc8d-e7b2843c2c6f' })
  @PrimaryGeneratedColumn('uuid')
  saleId: string;

  @ApiProperty({ example: '2025-04-22T15:00:00.000Z' })
  @CreateDateColumn()
  fecha: Date;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.ventas)
  employee: User;

  @ApiProperty({ type: () => Location })
  @ManyToOne(() => Location, (location) => location.ventas)
  location: Location;

  @ApiProperty({ type: () => [SaleItem] })
  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];

  @ApiProperty({ example: false })
  @Column({ default: false })
  cancelada: boolean;
}
