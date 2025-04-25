import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from 'src/products/entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class SaleItem {
  @ApiProperty({ example: '1f412cda-9f63-4db7-b7e6-d6e875f2f9e1' })
  @PrimaryGeneratedColumn('uuid')
  saleItemId: string;

  @ApiProperty({ type: () => Sale })
  @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: 'CASCADE' })
  sale: Sale;

  @ApiProperty({ type: () => Product })
  @ManyToOne(() => Product)
  product: Product;

  @ApiProperty({ example: 1.25 })
  @Column('float')
  peso_kg: number;

  @ApiProperty({ example: 95.5 })
  @Column('float')
  precio_por_kg: number;

  @ApiProperty({ example: 119.38 })
  @Column('float')
  subtotal: number;
}
