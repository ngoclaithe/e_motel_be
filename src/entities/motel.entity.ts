import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Room } from './room.entity';
import { Image } from './image.entity';

@Entity('motels')
export class Motel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  totalRooms: number;

  @Column({ nullable: true })
  logo: string;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

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