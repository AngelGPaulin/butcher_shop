import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
  } from 'typeorm';
  import { Employee } from 'src/employees/entities/employee.entity';
  import { Location } from 'src/locations/entities/location.entity';
  import { SaleItem } from './sale-item.entity';
  import { ApiProperty } from '@nestjs/swagger';
  
  @Entity()
  export class Sale {
    @ApiProperty({ example: '4c978d84-4b7a-4d52-9bb3-44c4dbab8a9a' })
    @PrimaryGeneratedColumn('uuid')
    saleId: string;
  
    @ApiProperty({ example: '2025-04-07T14:22:00.000Z' })
    @CreateDateColumn()
    fecha: Date;
  
    @ApiProperty({ type: () => Employee })
    @ManyToOne(() => Employee, (employee) => employee.ventas)
    employee: Employee;
  
    @ApiProperty({ type: () => Location })
    @ManyToOne(() => Location, (location) => location.ventas)
    location: Location;
  
    @ApiProperty({ type: () => [SaleItem] })
    @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
    items: SaleItem[];
  }
  