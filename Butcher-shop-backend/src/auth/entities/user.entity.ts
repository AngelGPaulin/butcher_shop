import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ROLES } from 'src/auth/constants/roles.constants';

@Entity()
export class User {
  @ApiProperty({ example: 'b173c95f-88a7-4d24-a52c-8e6d8dcad3a1' })
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @ApiProperty({ example: 'usuario123' })
  @Column('text')
  nombre_usuario: string;

  @ApiProperty({ example: 'hashedpassword123' })
  @Column({ type: 'text' })
  contrasena: string;

  @ApiProperty({ example: 'Employee' })
  @Column({ type: 'enum', enum: ROLES })
  rol: ROLES;
}
