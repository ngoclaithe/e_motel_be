import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback, FeedbackStatus } from './entities/feedback.entity';
import { CreateFeedbackDto, UpdateFeedbackDto } from './dto/feedback.dto';
import { Room } from '../room/entities/room.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateFeedbackDto, userId: string) {
    const room = await this.roomRepository.findOne({ where: { id: dto.roomId } });
    if (!room) throw new NotFoundException('Room not found');

    const fb = this.feedbackRepository.create({
      title: dto.title,
      description: dto.description,
      roomId: dto.roomId,
      userId,
      images: dto.images || [],
      status: FeedbackStatus.PENDING,
    });

    if (dto.images && dto.images.length) {
      const uploads = await Promise.all(dto.images.map(async (img) => {
        if (img.startsWith('data:image')) {
          const res = await this.cloudinaryService.uploadImage(img);
          return res.url;
        }
        return img;
      }));
      fb.images = uploads as string[];
    }

    return this.feedbackRepository.save(fb);
  }

  async findAll() {
    return this.feedbackRepository.find({ relations: ['room', 'user'] });
  }

  async findOne(id: string) {
    const fb = await this.feedbackRepository.findOne({ where: { id }, relations: ['room', 'user'] });
    if (!fb) throw new NotFoundException('Feedback not found');
    return fb;
  }

  async update(id: string, userId: string, userRole: string, dto: UpdateFeedbackDto) {
    const fb = await this.findOne(id);
    if (userRole !== 'ADMIN' && userRole !== 'LANDLORD' && fb.userId !== userId) {
      throw new ForbiddenException('No permission');
    }

    if (dto.images && dto.images.length) {
      const uploads = await Promise.all(dto.images.map(async (img) => {
        if (img.startsWith('data:image')) {
          const res = await this.cloudinaryService.uploadImage(img);
          return res.url;
        }
        return img;
      }));
      dto.images = uploads as string[];
    }

    Object.assign(fb, dto);
    return this.feedbackRepository.save(fb);
  }

  async remove(id: string, userId: string, userRole: string) {
    const fb = await this.findOne(id);
    if (userRole !== 'ADMIN' && fb.userId !== userId) throw new ForbiddenException('No permission');
    await this.feedbackRepository.remove(fb);
  }
}