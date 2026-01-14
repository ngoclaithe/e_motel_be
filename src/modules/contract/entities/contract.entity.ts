import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Room } from '../../room/entities/room.entity';
import { Motel } from '../../motel/entities/motel.entity';
import { User } from '../../user/entities/user.entity';
import { Bill } from '../../bill/entities/bill.entity';

export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  PENDING_TENANT = 'PENDING_TENANT',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED'
}

export enum ContractType {
  ROOM = 'ROOM',   
  MOTEL = 'MOTEL'  
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ContractType,
    default: ContractType.ROOM
  })
  type: ContractType;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'float', nullable: true })
  monthlyRent: number;

  @Column('float')
  deposit: number;

  @Column({ type: 'float', default: 1 })
  paymentCycleMonths: number;

  @Column({ type: 'int', nullable: true })
  paymentDay: number;

  @Column({ type: 'int', default: 1 })
  depositMonths: number;

  @Column({ type: 'float', nullable: true })
  electricityCostPerKwh: number;

  @Column({ type: 'float', nullable: true })
  waterCostPerCubicMeter: number;

  @Column({ type: 'float', nullable: true })
  internetCost: number;

  @Column({ type: 'float', nullable: true })
  parkingCost: number;

  @Column({ type: 'float', nullable: true })
  serviceFee: number;

  @Column({ default: false })
  hasWifi: boolean;

  @Column({ default: false })
  hasParking: boolean;

  @Column({ type: 'int', default: 4 })
  maxOccupants: number;

  @Column({ type: 'text', nullable: true })
  documentContent: string;

  @Column({ nullable: true })
  documentUrl: string;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.PENDING_TENANT
  })
  status: ContractStatus;

  @Column({ type: 'text', nullable: true })
  specialTerms: string;

  @Column({ type: 'text', nullable: true })
  regulations: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  roomId: string;

  @ManyToOne(() => Room, { nullable: true })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column({ nullable: true })
  motelId: string;

  @ManyToOne(() => Motel, { nullable: true })
  @JoinColumn({ name: 'motelId' })
  motel: Motel;

  @Column()
  tenantId: string;

  @ManyToOne(() => User, user => user.contracts)
  @JoinColumn({ name: 'tenantId' })
  tenant: User;

  @OneToMany(() => Bill, bill => bill.contract)
  bills: Bill[];
}
