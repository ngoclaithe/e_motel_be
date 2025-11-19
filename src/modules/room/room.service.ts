import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomStatus } from './entities/room.entity';
import { Image } from '../image/entities/image.entity';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  // Kiểm tra URL hợp lệ
  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // Validate danh sách URL ảnh
  private validateImageUrls(urls: string[]): void {
    const invalidUrls = urls.filter((url) => !this.isValidUrl(url));
    if (invalidUrls.length > 0) {
      throw new BadRequestException(`Invalid image URLs: ${invalidUrls.join(', ')}`);
    }
  }

  // Tạo phòng mới (phải gán ownerId từ user đăng nhập)
  async create(createRoomDto: CreateRoomDto, ownerId: string): Promise<Room> {
    const { images, ...roomData } = createRoomDto;

    if (images && images.length > 0) {
      this.validateImageUrls(images);
    }

    const room = this.roomRepository.create({
      ...roomData,
      ownerId, 
      status: RoomStatus.VACANT,
    });

    const savedRoom = await this.roomRepository.save(room);

    if (images && images.length > 0) {
      const imageEntities = images.map((url) =>
        this.imageRepository.create({
          url,
          roomId: savedRoom.id,
        }),
      );
      await this.imageRepository.save(imageEntities);
    }

    return this.findOne(savedRoom.id);
  }

  // Lấy toàn bộ phòng (admin)
  async findAll(): Promise<Room[]> {
    return this.roomRepository.find({
      relations: ['owner', 'tenant', 'images', 'contracts', 'feedbacks'],
      order: { createdAt: 'DESC' },
    });
  }

  // Lấy chi tiết phòng
  async findOne(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['owner', 'tenant', 'images', 'contracts', 'feedbacks'],
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  // Cập nhật phòng
  async update(
    id: string,
    userId: string,
    userRole: UserRole,
    updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    console.log('update() called with', { id, userId, userRole });

    const room = await this.findOne(id);

    if (userRole !== UserRole.ADMIN && room.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this room');
    }

    const { images, ...roomData } = updateRoomDto;

    Object.assign(room, roomData);
    await this.roomRepository.save(room);

    if (images !== undefined) {
      if (images.length > 0) this.validateImageUrls(images);
      await this.imageRepository.delete({ roomId: id });
      if (images.length > 0) {
        const imageEntities = images.map((url) =>
          this.imageRepository.create({ url, roomId: id }),
        );
        await this.imageRepository.save(imageEntities);
      }
    }

    return this.findOne(id);
  }

  // Xóa phòng
  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    console.log('remove() called with', { id, userId, userRole });

    const room = await this.findOne(id);

    if (userRole !== UserRole.ADMIN && room.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this room');
    }

    if (room.contracts?.some((c) => c.status === 'ACTIVE')) {
      throw new BadRequestException('Cannot delete room with active contracts.');
    }

    await this.roomRepository.remove(room);
    console.log('Room deleted successfully:', id);
  }

  // Tìm các phòng trống
  async findVacant(): Promise<Room[]> {
    return this.roomRepository.find({
      where: { status: RoomStatus.VACANT },
      relations: ['images', 'owner'],
      order: { createdAt: 'DESC' },
    });
  }

  // Tìm phòng theo chủ sở hữu
  async findMyRooms(ownerId: string): Promise<Room[]> {
    console.log('findMyRooms() called with ownerId:', ownerId);

    const rooms = await this.roomRepository.find({
      where: { ownerId },
      relations: ['tenant', 'images', 'contracts', 'feedbacks'],
      order: { createdAt: 'DESC' },
    });

    console.log('Rooms found:', rooms.length);
    return rooms;
  }

  // Cập nhật trạng thái phòng
  async updateStatus(id: string, status: RoomStatus): Promise<Room> {
    const room = await this.findOne(id);
    room.status = status;
    return this.roomRepository.save(room);
  }
}