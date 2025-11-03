import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomStatus } from './entities/room.entity';
import { Image } from '../image/entities/image.entity';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    // exclude images from initial create to avoid type mismatch with Image[] relation
    const { images, ...roomData } = createRoomDto as any;
    const room: Partial<Room> = this.roomRepository.create({ ...(roomData as any), status: RoomStatus.VACANT } as any) as Partial<Room>;

    // Save the room first to get the ID
    const savedRoom = (await this.roomRepository.save(room)) as Room;

    // Handle images if provided
    if (images && images.length > 0) {
      const imagePromises = images.map(async (imageData: string) => {
        if (imageData.startsWith('data:image')) {
          const uploadResult = await this.cloudinaryService.uploadImage(imageData);
          const image = this.imageRepository.create({
            url: uploadResult.url,
            roomId: savedRoom.id,
          });
          return this.imageRepository.save(image);
        }
      });

      await Promise.all(imagePromises);
    }

    return this.findOne(savedRoom.id);
  }

  async findAll(): Promise<Room[]> {
    return this.roomRepository.find({
      relations: ['motel', 'tenant', 'images', 'contracts', 'feedbacks'],
    });
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['motel', 'tenant', 'images', 'contracts', 'feedbacks'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async update(
    id: string, 
    userId: string, 
    userRole: UserRole, 
    updateRoomDto: UpdateRoomDto
  ): Promise<Room> {
    const room = await this.findOne(id);

    // Check if user has permission to update
    if (userRole !== UserRole.ADMIN && room.motel.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this room');
    }

    // Update room information
    Object.assign(room, updateRoomDto);

    // Handle images update if provided
    if (updateRoomDto.images && updateRoomDto.images.length > 0) {
      // Remove existing images
      await this.imageRepository.delete({ roomId: id });

      // Upload and save new images
      const imagePromises = updateRoomDto.images.map(async (imageData) => {
        if (imageData.startsWith('data:image')) {
          const uploadResult = await this.cloudinaryService.uploadImage(imageData);
          const image = this.imageRepository.create({
            url: uploadResult.url,
            roomId: id,
          });
          return this.imageRepository.save(image);
        }
      });

      await Promise.all(imagePromises);
    }

    return this.roomRepository.save(room);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const room = await this.findOne(id);

    if (userRole !== UserRole.ADMIN && room.motel.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this room');
    }

    await this.roomRepository.remove(room);
  }

  async findByMotel(motelId: string): Promise<Room[]> {
    return this.roomRepository.find({
      where: { motelId },
      relations: ['tenant', 'images', 'contracts', 'feedbacks'],
    });
  }

  async findVacant(): Promise<Room[]> {
    return this.roomRepository.find({
      where: { status: RoomStatus.VACANT },
      relations: ['motel', 'images'],
    });
  }

  async updateStatus(id: string, status: RoomStatus): Promise<Room> {
    const room = await this.findOne(id);
    room.status = status;
    return this.roomRepository.save(room);
  }
}