import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { FeedbackStatus } from '../entities/feedback.entity';

export class CreateFeedbackDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  roomId: string;

  @IsArray()
  @IsOptional()
  images?: string[];
}

export class UpdateFeedbackDto {
  @IsEnum(FeedbackStatus)
  @IsOptional()
  status?: FeedbackStatus;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}