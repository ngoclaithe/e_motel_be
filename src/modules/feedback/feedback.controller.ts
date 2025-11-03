import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, UpdateFeedbackDto } from './dto/feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('feedbacks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  create(@Body() dto: CreateFeedbackDto, @Req() req) {
    return this.feedbackService.create(dto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  findAll() {
    return this.feedbackService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  update(@Param('id') id: string, @Req() req, @Body() dto: UpdateFeedbackDto) {
    return this.feedbackService.update(id, req.user.id, req.user.role, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  remove(@Param('id') id: string, @Req() req) {
    return this.feedbackService.remove(id, req.user.id, req.user.role);
  }
}