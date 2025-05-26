import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    OneToMany,
  } from 'typeorm';
  import { Product } from 'src/products/entities/product.entity';
  import { Location } from 'src/locations/entities/location.entity';
  import { User } from 'src/auth/entities/user.entity';
  import { ApiProperty } from '@nestjs/swagger';
import { Provider } from 'src/providers/entities/provider.entity';
  
  @Entity()
  export class StockMovement {
    @ApiProperty({ example: 'e1a5e4a2-b9a1-46d3-83aa-ecf1039179a1' })
    @PrimaryGeneratedColumn('uuid')
    stockMovementId: string;
  
    @ApiProperty({ example: 'entrada', enum: ['entrada', 'salida'] })
    @Column({ type: 'enum', enum: ['entrada', 'salida'] })
    tipo: 'entrada' | 'salida';
  
    @ApiProperty({ example: 25.5, description: 'Peso en kilogramos' })
    @Column('float')
    peso_kg: number;
  
    @ApiProperty({ example: '2025-04-07T12:30:00.000Z' })
    @CreateDateColumn()
    fecha: Date;
  
    @ApiProperty({ type: () => Product })
    @ManyToOne(() => Product, { eager: true })
    producto: Product;
  
    @ApiProperty({ type: () => Location })
    @ManyToOne(() => Location, (location) => location, { eager: true })
    location: Location;
  
    @ApiProperty({ type: () => User })
    @ManyToOne(() => User, { eager: true })
    registradoPor: User;

    @ManyToOne(() => Provider, (provider) => provider.movimientos, { eager: true, nullable: true })
    proveedor: Provider;


  }
  