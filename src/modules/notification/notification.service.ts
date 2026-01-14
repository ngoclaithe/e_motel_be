import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UserRole } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        private userService: UserService,
    ) { }

    async create(dto: CreateNotificationDto, createdById: string): Promise<Notification> {
        let toUserId: string | null = null;

        if (dto.toEmail) {
            const user = await this.userService.findByEmail(dto.toEmail);
            if (user) {
                toUserId = user.id;
            }
        } else if (dto.toUserId) {
            toUserId = dto.toUserId;
        }

        const notification = this.notificationRepository.create({
            title: dto.title,
            message: dto.message,
            toRole: dto.toRole || null,
            toUserId: toUserId,
            createdById,
            isRead: false,
        });

        return this.notificationRepository.save(notification);
    }

    async findMyNotifications(userId: string, userRole: UserRole): Promise<Notification[]> {
        const qb = this.notificationRepository
            .createQueryBuilder('notification')
            .leftJoinAndSelect('notification.createdBy', 'createdBy')
            .where('notification.isRead = :isRead', { isRead: false })
            .andWhere(
                '(notification.toUserId = :userId OR notification.toRole = :userRole OR notification.toRole IS NULL)',
                { userId, userRole }
            )
            .orderBy('notification.createdAt', 'DESC');

        return qb.getMany();
    }

    async findAll(): Promise<Notification[]> {
        return this.notificationRepository.find({
            relations: ['createdBy', 'toUser'],
            order: { createdAt: 'DESC' },
        });
    }

    async markAsRead(id: string, userId: string): Promise<Notification> {
        const notification = await this.notificationRepository.findOne({
            where: { id },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        if (notification.toUserId && notification.toUserId !== userId) {
            throw new ForbiddenException('You do not have permission to mark this notification as read');
        }

        notification.isRead = true;
        return this.notificationRepository.save(notification);
    }

    async remove(id: string): Promise<void> {
        const result = await this.notificationRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Notification not found');
        }
    }
}
