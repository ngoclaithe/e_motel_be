import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Room, RoomStatus } from './entities/room.entity';
import { Image } from '../image/entities/image.entity';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { UserRole } from '../user/entities/user.entity';
import { Motel } from '../motel/entities/motel.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(Motel)
    private readonly motelRepository: Repository<Motel>,
  ) {}

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Validate image URLs
   */
  private validateImageUrls(urls: string[]): void {
    const invalidUrls = urls.filter(url => !this.isValidUrl(url));
    if (invalidUrls.length > 0) {
      throw new BadRequestException(`Invalid image URLs: ${invalidUrls.join(', ')}`);
    }
  }

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const { images, ...roomData } = createRoomDto;

    // Validate image URLs if provided
    if (images && images.length > 0) {
      this.validateImageUrls(images);
    }

    // Create room
    const room = this.roomRepository.create({
      ...roomData,
      status: RoomStatus.VACANT,
    });

    // Save room
    const savedRoom = await this.roomRepository.save(room);

    // Create image entities if images provided
    if (images && images.length > 0) {
      const imageEntities = images.map(url => 
        this.imageRepository.create({
          url,
          roomId: savedRoom.id,
        })
      );
      await this.imageRepository.save(imageEntities);
    }

    return this.findOne(savedRoom.id);
  }

  async findAll(): Promise<Room[]> {
    return this.roomRepository.find({
      relations: ['motel', 'tenant', 'images', 'contracts', 'feedbacks'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['motel', 'tenant', 'images', 'contracts', 'feedbacks'],
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
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
    // Admin can update any room
    // Owner can update rooms in their motel
    // For standalone rooms (no motel), only admin can update
    if (userRole !== UserRole.ADMIN) {
      if (!room.motel || room.motel.ownerId !== userId) {
        throw new ForbiddenException('You do not have permission to update this room');
      }
    }

    const { images, ...roomData } = updateRoomDto;

    // Update room information
    Object.assign(room, roomData);
    await this.roomRepository.save(room);

    // Handle images update if provided
    if (images !== undefined) {
      // Validate URLs
      if (images.length > 0) {
        this.validateImageUrls(images);
      }

      // Remove all existing images
      await this.imageRepository.delete({ roomId: id });

      // Create new images
      if (images.length > 0) {
        const imageEntities = images.map(url =>
          this.imageRepository.create({
            url,
            roomId: id,
          })
        );
        await this.imageRepository.save(imageEntities);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const room = await this.findOne(id);

    // Check permission
    if (userRole !== UserRole.ADMIN) {
      if (!room.motel || room.motel.ownerId !== userId) {
        throw new ForbiddenException('You do not have permission to delete this room');
      }
    }

    // Delete all related images first
    await this.imageRepository.delete({ roomId: id });

    // Then delete the room
    await this.roomRepository.remove(room);
  }

  async findByMotel(motelId: string): Promise<Room[]> {
    return this.roomRepository.find({
      where: { motelId },
      relations: ['tenant', 'images', 'contracts', 'feedbacks'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findStandaloneRooms(): Promise<Room[]> {
    return this.roomRepository.find({
      where: { motelId: null },
      relations: ['tenant', 'images', 'contracts', 'feedbacks'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findVacant(): Promise<Room[]> {
    return this.roomRepository.find({
      where: { status: RoomStatus.VACANT },
      relations: ['motel', 'images'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Find all rooms owned by a landlord (rooms in their motels)
   */
  async findMyRooms(ownerId: string): Promise<Room[]> {
    // First, get all motels owned by this user
    const motels = await this.motelRepository.find({
      where: { ownerId },
      select: ['id'],
    });

    if (motels.length === 0) {
      return [];
    }

    const motelIds = motels.map(motel => motel.id);

    // Then get all rooms in those motels
    return this.roomRepository.find({
      where: { motelId: In(motelIds) },
      relations: ['motel', 'tenant', 'images', 'contracts', 'feedbacks'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateStatus(id: string, status: RoomStatus): Promise<Room> {
    const room = await this.findOne(id);
    room.status = status;
    return this.roomRepository.save(room);
  }
}