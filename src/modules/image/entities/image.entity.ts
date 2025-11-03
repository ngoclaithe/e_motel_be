import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Motel } from '../../motel/entities/motel.entity';
import { Room } from '../../room/entities/room.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @Column({ nullable: true })
  motelId: string;

  @ManyToOne(() => Motel, motel => motel.images)
  @JoinColumn({ name: 'motelId' })
  motel: Motel;

  @Column({ nullable: true })
  roomId: string;

  @ManyToOne(() => Room, room => room.images)
  @JoinColumn({ name: 'roomId' })
  room: Room;
}