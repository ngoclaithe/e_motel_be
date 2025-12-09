import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() createNotificationDto: CreateNotificationDto, @Req() req) {
        return this.notificationService.create(createNotificationDto, req.user.id);
    }

    @Get('my')
    findMyNotifications(@Req() req) {
        return this.notificationService.findMyNotifications(req.user.id, req.user.role);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    findAll() {
        return this.notificationService.findAll();
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string, @Req() req) {
        return this.notificationService.markAsRead(id, req.user.id);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.notificationService.remove(id);
    }
}
