import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Motel } from '../../motel/entities/motel.entity';
import { User } from '../../user/entities/user.entity';
import { Contract } from '../../contract/entities/contract.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';
import { Image } from '../../image/entities/image.entity';

export enum RoomStatus {
  VACANT = 'VACANT',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE'
}

export enum BathroomType {
  PRIVATE = 'PRIVATE',    // Khép kín (WC riêng)
  SHARED = 'SHARED'       // Chung
}

export enum FurnishingStatus {
  FULLY_FURNISHED = 'FULLY_FURNISHED',     // Đầy đủ nội thất
  PARTIALLY_FURNISHED = 'PARTIALLY_FURNISHED', // Nội thất cơ bản
  UNFURNISHED = 'UNFURNISHED'              // Không nội thất
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: string;

  @Column('float')
  area: number; // Diện tích (m²)

  @Column('float')
  price: number; // Giá thuê/tháng

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.VACANT
  })
  status: RoomStatus;

  // Bathroom
  @Column({
    type: 'enum',
    enum: BathroomType,
    default: BathroomType.PRIVATE
  })
  bathroomType: BathroomType;

  @Column({ default: false })
  hasWaterHeater: boolean; // Nóng lạnh

  // Room Features
  @Column({
    type: 'enum',
    enum: FurnishingStatus,
    default: FurnishingStatus.UNFURNISHED
  })
  furnishingStatus: FurnishingStatus;

  @Column({ default: false })
  hasAirConditioner: boolean;

  @Column({ default: false })
  hasBalcony: boolean; // Ban công

  @Column({ default: false })
  hasWindow: boolean; // Cửa sổ

  @Column({ default: false })
  hasKitchen: boolean; // Bếp riêng

  @Column({ default: false })
  hasRefrigerator: boolean; // Tủ lạnh

  @Column({ default: false })
  hasWashingMachine: boolean; // Máy giặt riêng

  @Column({ default: false })
  hasWardrobe: boolean; // Tủ quần áo

  @Column({ default: false })
  hasBed: boolean; // Giường

  @Column({ default: false })
  hasDesk: boolean; // Bàn học/làm việc

  @Column({ default: false })
  hasWifi: boolean;

  // Capacity & Restrictions
  @Column({ type: 'int', default: 2 })
  maxOccupancy: number; // Số người tối đa

  @Column({ default: false })
  allowPets: boolean;

  @Column({ default: false })
  allowCooking: boolean;

  @Column({ default: false })
  allowOppositeGender: boolean; // Cho phép ở ghép nam/nữ

  // Floor & Position
  @Column({ type: 'int', nullable: true })
  floor: number; // Tầng

  // Utilities Cost
  @Column({ type: 'float', nullable: true })
  electricityCostPerKwh: number;

  @Column({ type: 'float', nullable: true })
  waterCostPerCubicMeter: number;

  @Column({ type: 'float', nullable: true })
  internetCost: number;

  @Column({ type: 'float', nullable: true })
  parkingCost: number;

  @Column({ type: 'float', nullable: true })
  serviceFee: number; // Phí dịch vụ (rác, vệ sinh chung,...)

  // Payment Terms
  @Column({ type: 'int', default: 1 })
  paymentCycleMonths: number;

  @Column({ type: 'int', default: 1 })
  depositMonths: number;

  // Additional Info
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  amenities: string[]; // Tiện nghi khác

  @Column({ type: 'date', nullable: true })
  availableFrom: Date; // Có thể vào ở từ ngày

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column({ nullable: true })
  motelId: string;

  @ManyToOne(() => Motel, motel => motel.rooms, { nullable: true })
  @JoinColumn({ name: 'motelId' })
  motel: Motel;

  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => User, user => user.rentedRooms)
  @JoinColumn({ name: 'tenantId' })
  tenant: User;

  @OneToMany(() => Contract, contract => contract.room)
  contracts: Contract[];

  @OneToMany(() => Feedback, feedback => feedback.room)
  feedbacks: Feedback[];

  @OneToMany(() => Image, image => image.room)
  images: Image[];
}