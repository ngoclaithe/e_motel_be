import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Room } from '../../room/entities/room.entity';
import { User } from '../../user/entities/user.entity';
import { Bill } from '../../bill/entities/bill.entity';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column('float')
  deposit: number;

  @Column('int')
  paymentCycle: number; // months

  @Column({ nullable: true })
  documentUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

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