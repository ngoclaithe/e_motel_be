import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Contract } from '../../contract/entities/contract.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';
import { Image } from '../../image/entities/image.entity';

export enum RoomStatus {
  VACANT = 'VACANT',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum BathroomType {
  PRIVATE = 'PRIVATE',
  SHARED = 'SHARED',
}

export enum FurnishingStatus {
  FULLY_FURNISHED = 'FULLY_FURNISHED',
  PARTIALLY_FURNISHED = 'PARTIALLY_FURNISHED',
  UNFURNISHED = 'UNFURNISHED',
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: string;

  @Column({ unique: true, nullable: true })
  slug: string;

  @Column({ nullable: true })
  address: string;

  @Column('float')
  area: number;

  @Column('float')
  price: number;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.VACANT,
  })
  status: RoomStatus;

  @Column({
    type: 'enum',
    enum: BathroomType,
    default: BathroomType.PRIVATE,
  })
  bathroomType: BathroomType;

  @Column({ default: false })
  hasWaterHeater: boolean;

  @Column({
    type: 'enum',
    enum: FurnishingStatus,
    default: FurnishingStatus.UNFURNISHED,
  })
  furnishingStatus: FurnishingStatus;

  // Room features
  @Column({ default: false }) hasAirConditioner: boolean;
  @Column({ default: false }) hasBalcony: boolean;
  @Column({ default: false }) hasWindow: boolean;
  @Column({ default: false }) hasKitchen: boolean;
  @Column({ default: false }) hasRefrigerator: boolean;
  @Column({ default: false }) hasWashingMachine: boolean;
  @Column({ default: false }) hasWardrobe: boolean;
  @Column({ default: false }) hasBed: boolean;
  @Column({ default: false }) hasDesk: boolean;
  @Column({ default: false }) hasWifi: boolean;
  @Column({ default: false }) hasFan: boolean;
  @Column({ default: false }) hasKitchenTable: boolean;

  // Capacity & Restrictions
  @Column({ type: 'int', default: 2 })
  maxOccupancy: number;

  @Column({ default: false }) allowPets: boolean;
  @Column({ default: false }) allowCooking: boolean;
  @Column({ default: false }) allowOppositeGender: boolean;

  // Floor & Position
  @Column({ type: 'int', nullable: true })
  floor: number;

  // Utilities Cost
  @Column({ type: 'float', nullable: true, default: 0 })
  electricityCostPerKwh: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  waterCostPerCubicMeter: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  internetCost: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  parkingCost: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  serviceFee: number;

  // Equipment Management (Optional - Quản lý thiết bị)
  @Column({ type: 'int', default: 0 })
  airConditionerCount: number;

  @Column({ type: 'int', default: 0 })
  fanCount: number;

  @Column({ type: 'int', default: 0 })
  waterHeaterCount: number;

  @Column({ type: 'int', default: 0 })
  lightBulbCount: number;

  @Column({ type: 'text', nullable: true })
  otherEquipment: string; // JSON string for flexible equipment list

  // Payment Terms
  @Column({ type: 'int', nullable: true, default: 1 })
  paymentCycleMonths: number;

  @Column({ type: 'int', nullable: true, default: 1 })
  depositMonths: number;

  // Additional Info
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  amenities: string[];

  @Column({ type: 'date', nullable: true })
  availableFrom: Date;

  // Owner (landlord who owns this room directly)
  @Column()
  ownerId: string;

  @ManyToOne(() => User, (user) => user.ownedRooms)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  // Tenant (if occupied)
  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => User, (user) => user.rentedRooms)
  @JoinColumn({ name: 'tenantId' })
  tenant: User;

  @OneToMany(() => Contract, (contract) => contract.room, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  contracts: Contract[];

  @OneToMany(() => Feedback, (feedback) => feedback.room, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  feedbacks: Feedback[];

  @OneToMany(() => Image, (image) => image.room, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  images: Image[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}