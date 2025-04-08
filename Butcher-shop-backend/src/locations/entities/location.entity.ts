import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
  } from 'typeorm';
  import { Employee } from 'src/employees/entities/employee.entity';
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
  
    @OneToMany(() => Employee, (employee) => employee.location, { cascade: true })
    empleados: Employee[];
    @OneToMany(() => Sale, (sale) => sale.location)
    ventas: Sale[];

  }
  