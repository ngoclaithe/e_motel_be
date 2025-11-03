import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Room } from './room.entity';
import { User } from './user.entity';
import { Bill } from './bill.entity';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column('float')
  deposit: number;

  @Column()
  paymentCycle: number;

  @Column({ nullable: true })
  documentUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column()
  roomId: string;

  @ManyToOne(() => Room, room => room.contracts)
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column()
  tenantId: string;

  @ManyToOne(() => User, user => user.contracts)
  @JoinColumn({ name: 'tenantId' })
  tenant: User;

  @OneToMany(() => Bill, bill => bill.contract)
  bills: Bill[];
}