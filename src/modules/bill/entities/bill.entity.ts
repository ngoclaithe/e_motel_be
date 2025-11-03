import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Contract } from '../../contract/entities/contract.entity';

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  month: Date;

  @Column('int')
  electricityStart: number;

  @Column('int')
  electricityEnd: number;

  @Column('int')
  waterStart: number;

  @Column('int')
  waterEnd: number;

  @Column('float')
  electricityRate: number;

  @Column('float')
  waterRate: number;

  @Column('float', { default: 0 })
  otherFees: number;

  @Column('float')
  totalAmount: number;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  contractId: string;

  @ManyToOne(() => Contract, contract => contract.bills)
  @JoinColumn({ name: 'contractId' })
  contract: Contract;
}