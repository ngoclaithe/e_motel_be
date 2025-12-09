import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { UserRole } from '../../user/entities/user.entity';

export class CreateNotificationDto {
    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsOptional()
    @IsEnum(UserRole)
    toRole?: UserRole;

    @IsOptional()
    @IsUUID()
    toUserId?: string;

    @IsOptional()
    @IsString()
    toEmail?: string;
}
