import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { Room } from '../../room/entities/room.entity';
import { Motel } from '../../motel/entities/motel.entity';
import { User } from '../../user/entities/user.entity';
import { Contract, ContractType } from './contract.entity';

export enum ContractRequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
}

export enum ContractRequestInitiator {
    LANDLORD = 'LANDLORD',
    TENANT = 'TENANT',
}

@Entity('contract_requests')
export class ContractRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: ContractType,
        default: ContractType.ROOM,
    })
    type: ContractType;

    @Column({
        type: 'enum',
        enum: ContractRequestInitiator,
    })
    initiatedBy: ContractRequestInitiator;

    @Column({
        type: 'enum',
        enum: ContractRequestStatus,
        default: ContractRequestStatus.PENDING,
    })
    status: ContractRequestStatus;

    // Room or Motel being requested
    @Column({ nullable: true })
    roomId: string;

    @ManyToOne(() => Room, { nullable: true })
    @JoinColumn({ name: 'roomId' })
    room: Room;

    @Column({ nullable: true })
    motelId: string;

    @ManyToOne(() => Motel, { nullable: true })
    @JoinColumn({ name: 'motelId' })
    motel: Motel;

    // Parties involved
    @Column()
    landlordId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'landlordId' })
    landlord: User;

    @Column()
    tenantId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'tenantId' })
    tenant: User;

    // Contract terms (proposed by initiator)
    @Column({ type: 'timestamp' })
    startDate: Date;

    @Column({ type: 'timestamp' })
    endDate: Date;

    @Column({ type: 'float' })
    monthlyRent: number;

    @Column({ type: 'float' })
    deposit: number;

    @Column({ type: 'float', nullable: true })
    electricityCostPerKwh: number;

    @Column({ type: 'float', nullable: true })
    waterCostPerCubicMeter: number;

    @Column({ type: 'float', nullable: true })
    internetCost: number;

    @Column({ type: 'float', nullable: true })
    parkingCost: number;

    @Column({ type: 'float', nullable: true })
    serviceFee: number;

    @Column({ type: 'text', nullable: true })
    specialTerms: string;

    @Column({ type: 'text', nullable: true })
    message: string; // Message from initiator

    @Column({ type: 'text', nullable: true })
    responseMessage: string; // Response from approver

    @Column({ type: 'timestamp', nullable: true })
    respondedAt: Date;

    // If approved, link to created contract
    @Column({ nullable: true })
    contractId: string;

    @OneToOne(() => Contract, { nullable: true })
    @JoinColumn({ name: 'contractId' })
    contract: Contract;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
