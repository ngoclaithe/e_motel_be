import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Room } from '../../room/entities/room.entity';
import { Motel } from '../../motel/entities/motel.entity';
import { User } from '../../user/entities/user.entity';
import { Bill } from '../../bill/entities/bill.entity';

export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED'
}

export enum ContractType {
  ROOM = 'ROOM',   // Thuê phòng
  MOTEL = 'MOTEL'  // Thuê cả nhà trọ
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
  type: ContractType; // Loại hợp đồng

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'float', nullable: true }) 
  monthlyRent: number;

  @Column('float')
  deposit: number; // Tiền đặt cọc

  @Column({ type: 'float', default: 1 })
  paymentCycleMonths: number; // Chu kỳ thanh toán (tháng)

  @Column({ type: 'int', nullable: true })
  paymentDay: number; // Ngày thanh toán hàng tháng (1-31)

  @Column({ type: 'int', default: 1 })
  depositMonths: number;

  // Utilities pricing (lưu tại thời điểm ký HĐ)
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

  // Thông tin dịch vụ
  @Column({ default: false })
  hasWifi: boolean;

  @Column({ default: false })
  hasParking: boolean;

  @Column({ type: 'int', default: 4 })
  maxOccupants: number; // Số người tối đa

  // Document
  @Column({ type: 'text', nullable: true })
  documentContent: string; // Nội dung văn bản hợp đồng (HTML/Text)

  @Column({ nullable: true })
  documentUrl: string; // URL file PDF nếu có

  // Status
  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.ACTIVE
  })
  status: ContractStatus;

  // Additional terms
  @Column({ type: 'text', nullable: true })
  specialTerms: string; // Điều khoản đặc biệt (nếu có)

  @Column({ type: 'text', nullable: true })
  regulations: string; // Nội quy (từ motel)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations - Room (nullable vì có thể thuê cả motel)
  @Column({ nullable: true })
  roomId: string;

  @ManyToOne(() => Room, room => room.contracts, { nullable: true })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  // Relations - Motel (nullable vì có thể chỉ thuê room)
  @Column({ nullable: true })
  motelId: string;

  @ManyToOne(() => Motel, motel => motel.contracts, { nullable: true })
  @JoinColumn({ name: 'motelId' })
  motel: Motel;

  // Tenant
  @Column()
  tenantId: string;

  @ManyToOne(() => User, user => user.contracts)
  @JoinColumn({ name: 'tenantId' })
  tenant: User;

  @OneToMany(() => Bill, bill => bill.contract)
  bills: Bill[];
}