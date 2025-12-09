import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User, UserRole } from '../../user/entities/user.entity';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    message: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        nullable: true
    })
    toRole: UserRole;

    @Column({ nullable: true })
    toUserId: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'toUserId' })
    toUser: User;

    @Column({ nullable: true })
    createdById: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'createdById' })
    createdBy: User;

    @Column({ default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
