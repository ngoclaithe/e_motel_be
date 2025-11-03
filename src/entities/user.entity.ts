import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Motel } from './motel.entity';
import { Room } from './room.entity';
import { Contract } from './contract.entity';
import { Feedback } from './feedback.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  LANDLORD = 'LANDLORD',
  TENANT = 'TENANT'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.TENANT
  })
  role: UserRole;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  identityCard: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Motel, motel => motel.owner)
  ownedMotels: Motel[];

  @OneToMany(() => Room, room => room.tenant)
  rentedRooms: Room[];

  @OneToMany(() => Contract, contract => contract.tenant)
  contracts: Contract[];

  @OneToMany(() => Feedback, feedback => feedback.user)
  feedbacks: Feedback[];
}