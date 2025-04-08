import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    ManyToOne,
    OneToMany,
  } from 'typeorm';
  import { User } from 'src/auth/entities/user.entity';
  import { Location } from 'src/locations/entities/location.entity';
  import { Sale } from 'src/sales/entities/sale.entity';
  
  @Entity()
  export class Employee {
    @PrimaryGeneratedColumn('uuid')
    employeeId: string;
  
    @Column('text')
    nombre_completo: string;
  
    @Column('text')
    telefono: string;
  
    @Column('text')
    direccion: string;
  
    @OneToOne(() => User, { cascade: true })
    @JoinColumn({ name: 'userId' })
    user: User;
  
    @ManyToOne(() => Location, (location) => location.empleados)
    @JoinColumn({ name: 'locationId' })
    location: Location;
    @OneToMany(() => Sale, (sale) => sale.employee)
    ventas: Sale[];

  }
  