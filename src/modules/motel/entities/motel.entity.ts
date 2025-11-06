import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Room } from '../../room/entities/room.entity';
import { Image } from '../../image/entities/image.entity';

export enum AlleyType {
  CAR = 'CAR',          
  MOTORBIKE = 'MOTORBIKE', 
  WALKING = 'WALKING'     
}

export enum SecurityType {
  CAMERA = 'CAMERA',           
  GUARD = 'GUARD',             
  FINGERPRINT = 'FINGERPRINT', 
  NONE = 'NONE'                
}

@Entity('motels')
export class Motel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true, length: 2000 })
  description: string;

  @Column()
  totalRooms: number;

  @Column({ type: 'float', nullable: true })
  monthlyRent: number;
  
  // Location
  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  // Access & Infrastructure
  @Column({
    type: 'enum',
    enum: AlleyType,
    nullable: true
  })
  alleyType: AlleyType;

  @Column({ type: 'float', nullable: true })
  alleyWidth: number; 

  @Column({ default: false })
  hasElevator: boolean; 

  @Column({ default: false })
  hasParking: boolean; 

  // Security
  @Column({
    type: 'enum',
    enum: SecurityType,
    default: SecurityType.NONE
  })
  securityType: SecurityType;

  @Column({ default: false })
  has24hSecurity: boolean; 

  // Utilities & Amenities
  @Column({ default: false })
  hasWifi: boolean;

  @Column({ default: false })
  hasAirConditioner: boolean;

  @Column({ default: false })
  hasWashingMachine: boolean; 

  @Column({ default: false })
  hasKitchen: boolean; 

  @Column({ default: false })
  hasRooftop: boolean; 

  @Column({ default: false })
  allowPets: boolean;

  @Column({ default: false })
  allowCooking: boolean; 

  // Pricing & Payment
  @Column({ type: 'float', nullable: true })
  electricityCostPerKwh: number; 

  @Column({ type: 'float', nullable: true })
  waterCostPerCubicMeter: number; 

  @Column({ type: 'float', nullable: true })
  internetCost: number; 

  @Column({ type: 'float', nullable: true })
  parkingCost: number; 

  @Column({ type: 'int', default: 1 })
  paymentCycleMonths: number; 

  @Column({ type: 'int', default: 1 })
  depositMonths: number; 

  // Contact Info
  @Column({ nullable: true })
  contactPhone: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactZalo: string;

  // Additional Info
  @Column({ type: 'text', nullable: true })
  regulations: string; 

  @Column({ type: 'simple-array', nullable: true })
  nearbyPlaces: string[]; 

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column()
  ownerId: string;

  @ManyToOne(() => User, user => user.ownedMotels)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => Room, room => room.motel)
  rooms: Room[];

  @OneToMany(() => Image, image => image.motel)
  images: Image[];
}