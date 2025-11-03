import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Contract } from './contract.entity';

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  month: Date;

  @Column()
  electricityStart: number;

  @Column()
  electricityEnd: number;

  @Column()
  waterStart: number;

  @Column()
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

  @Column({ nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column()
  contractId: string;

  @ManyToOne(() => Contract, contract => contract.bills)
  @JoinColumn({ name: 'contractId' })
  contract: Contract;
}