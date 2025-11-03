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

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: string;

  @Column('float')
  area: number;

  @Column('float')
  price: number;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.VACANT
  })
  status: RoomStatus;

  @Column('simple-array')
  amenities: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column()
  motelId: string;

  @ManyToOne(() => Motel, motel => motel.rooms)
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