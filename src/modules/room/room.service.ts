import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomStatus } from './entities/room.entity';
import { Motel } from '../motel/entities/motel.entity';
import { Image } from '../image/entities/image.entity';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { SearchRoomDto } from './dto/search-room.dto';
import { User, UserRole } from '../user/entities/user.entity';
import slugify from 'slugify';

@Injectable()
export class RoomService implements OnModuleInit {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(Motel)
    private readonly motelRepository: Repository<Motel>,
  ) { }

  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async onModuleInit() {
    console.log('RoomService: Checking for missing slugs...');
    const rooms = await this.roomRepository.createQueryBuilder('room')
      .where('room.slug IS NULL')
      .getMany();

    for (const room of rooms) {
      room.slug = this.generateSlug(`phong-${room.number}`);
      await this.roomRepository.save(room);
      console.log(`Auto-generated slug for room ${room.number}: ${room.slug}`);
    }

    const motels = await this.motelRepository.createQueryBuilder('motel')
      .where('motel.slug IS NULL')
      .getMany();

    for (const motel of motels) {
      motel.slug = this.generateSlug(motel.name);
      await this.motelRepository.save(motel);
      console.log(`Auto-generated slug for motel ${motel.name}: ${motel.slug}`);
    }
    console.log('RoomService: Slug check completed.');
  }

  private validateImageUrls(urls: string[]): void {
    const invalidUrls = urls.filter((url) => !this.isValidUrl(url));
    if (invalidUrls.length > 0) {
      throw new BadRequestException(`Invalid image URLs: ${invalidUrls.join(', ')}`);
    }
  }

  private generateSlug(text: string): string {
    return slugify(text, { lower: true, locale: 'vi', strict: true }) + '-' + Math.random().toString(36).substring(2, 7);
  }

  private async validateMotelRelationship(motelId: string, ownerId: string, userRole: UserRole, currentRoomId?: string): Promise<void> {
    const motel = await this.motelRepository.findOne({
      where: { id: motelId },
      relations: ['rooms'],
    });

    if (!motel) {
      throw new NotFoundException(`Motel with ID ${motelId} not found`);
    }

    if (userRole !== UserRole.ADMIN && motel.ownerId !== ownerId) {
      throw new ForbiddenException('You do not have permission to link to this motel');
    }

    if (motel.totalRooms < 2) {
      throw new BadRequestException('Motel must have at least 2 rooms to link.');
    }

    const linkedRoomsCount = motel.rooms.filter(r => r.id !== currentRoomId).length;
    if (linkedRoomsCount >= motel.totalRooms) {
      throw new BadRequestException(`Motel already has maximum rooms linked (${motel.totalRooms}).`);
    }
  }

  async create(createRoomDto: CreateRoomDto, ownerId: string): Promise<Room> {
    const { images, ...roomData } = createRoomDto;

    if (images && images.length > 0) {
      this.validateImageUrls(images);
    }

    if (roomData.motelId) {
      await this.validateMotelRelationship(roomData.motelId, ownerId, UserRole.LANDLORD); 
    }

    const room = this.roomRepository.create({
      ...roomData,
      ownerId,
      status: RoomStatus.VACANT,
      slug: this.generateSlug(`phong-${roomData.number}`),
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

  async findAll(): Promise<Room[]> {
    return this.roomRepository.find({
      relations: ['owner', 'tenant', 'images', 'contracts', 'feedbacks'],
      order: { createdAt: 'DESC' },
    });
  }

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

  async findBySlug(slug: string): Promise<Room> {
    let room = await this.roomRepository.findOne({
      where: { slug },
      relations: ['owner', 'tenant', 'images', 'contracts', 'feedbacks'],
    });

    if (!room) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

      try {
        if (isUuid) {
          room = await this.findOne(slug);
        } else {
          room = await this.roomRepository.findOne({
            where: { id: slug as any },
            relations: ['owner', 'tenant', 'images', 'contracts', 'feedbacks'],
          });
        }
      } catch (e) {
        throw new NotFoundException(`Room with slug or ID ${slug} not found`);
      }
    }

    if (!room) {
      throw new NotFoundException(`Room with slug or ID ${slug} not found`);
    }

    return room;
  }

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

    if (roomData.motelId !== undefined && roomData.motelId !== room.motelId) {
      if (roomData.motelId) {
        await this.validateMotelRelationship(roomData.motelId, userId, userRole, id);
      }
    }

    if (roomData.number && roomData.number !== room.number) {
      room.slug = this.generateSlug(`phong-${roomData.number}`);
    }

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

  async remove(id: string, userId: string, userRole: UserRole): Promise<{ message: string }> {
    console.log('remove() called with', { id, userId, userRole });

    const room = await this.findOne(id);

    if (userRole !== UserRole.ADMIN && room.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this room');
    }

    if (room.contracts?.some((c) => c.status === 'ACTIVE')) {
      throw new BadRequestException('Cannot delete room with active contracts.');
    }

    await this.roomRepository.remove(room);
    return { message: 'Room deleted successfully' };
  }

  async searchPublic(query: SearchRoomDto) {
    if (query.type === 'MOTEL') {
      const qb = this.motelRepository.createQueryBuilder('motel')
        .leftJoinAndSelect('motel.images', 'images')
        .leftJoinAndSelect('motel.owner', 'owner');

      if (query.keyword) {
        const keyword = `%${query.keyword}%`;
        qb.andWhere(
          '(motel.name ILIKE :keyword OR motel.address ILIKE :keyword OR motel.description ILIKE :keyword OR owner.firstName ILIKE :keyword OR owner.lastName ILIKE :keyword)',
          { keyword },
        );
      }

      if (query.hasWifi) qb.andWhere('motel.hasWifi = :hasWifi', { hasWifi: true });
      if (query.hasParking) qb.andWhere('motel.hasParking = :hasParking', { hasParking: true });
      if (query.hasKitchen) qb.andWhere('motel.hasKitchen = :hasKitchen', { hasKitchen: true });
      if (query.hasAirConditioner) qb.andWhere('motel.hasAirConditioner = :hasAirConditioner', { hasAirConditioner: true });

      const page = query.page || 1;
      const limit = query.limit || 12;
      qb.skip((page - 1) * limit).take(limit);
      qb.orderBy('motel.createdAt', 'DESC');

      const [motels, total] = await qb.getManyAndCount();

      for (const motel of motels) {
        if (!motel.slug) {
          motel.slug = this.generateSlug(motel.name);
          await this.motelRepository.save(motel);
        }
      }

      return {
        data: motels,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        type: 'MOTEL'
      };
    }

    const qb = this.roomRepository.createQueryBuilder('room')
      .leftJoinAndSelect('room.images', 'images')
      .leftJoinAndSelect('room.owner', 'owner')
      .where('room.status = :status', { status: RoomStatus.VACANT });

    if (query.keyword) {
      const keyword = `%${query.keyword}%`;
      qb.andWhere(
        '(room.number ILIKE :keyword OR room.description ILIKE :keyword OR owner.address ILIKE :keyword OR owner.firstName ILIKE :keyword OR owner.lastName ILIKE :keyword)',
        { keyword },
      );
    }

    if (query.minPrice) {
      qb.andWhere('room.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice) {
      qb.andWhere('room.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.hasAirConditioner) {
      qb.andWhere('room.hasAirConditioner = :hasAirConditioner', { hasAirConditioner: true });
    }

    if (query.hasWifi) {
      qb.andWhere('room.hasWifi = :hasWifi', { hasWifi: true });
    }

    if (query.hasKitchen) {
      qb.andWhere('room.hasKitchen = :hasKitchen', { hasKitchen: true });
    }

    if (query.sort === 'price_asc') {
      qb.orderBy('room.price', 'ASC');
    } else if (query.sort === 'price_desc') {
      qb.orderBy('room.price', 'DESC');
    } else {
      qb.orderBy('room.createdAt', 'DESC');
    }

    const page = query.page || 1;
    const limit = query.limit || 12;
    qb.skip((page - 1) * limit).take(limit);

    const [rooms, total] = await qb.getManyAndCount();

    for (const room of rooms) {
      if (!room.slug) {
        room.slug = this.generateSlug(`phong-${room.number}`);
        await this.roomRepository.save(room);
      }
    }

    return {
      data: rooms,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      type: 'ROOM'
    };
  }

  async findVacant(): Promise<Room[]> {
    return this.roomRepository.find({
      where: { status: RoomStatus.VACANT },
      relations: ['images', 'owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async findMyRooms(userId: string, userRole?: string, status?: RoomStatus): Promise<Room[]> {
    const query = this.roomRepository.createQueryBuilder('room');

    if (userRole === 'TENANT') {
      query.where('room.tenantId = :userId', { userId });
      query.leftJoinAndSelect('room.owner', 'owner');
      query.leftJoinAndSelect('room.tenant', 'tenant');
    } else {
      query.where('room.ownerId = :userId', { userId });
      query.leftJoinAndSelect('room.tenant', 'tenant');
    }

    if (status) {
      query.andWhere('room.status = :status', { status });
    }

    query.leftJoinAndSelect('room.images', 'images');
    query.leftJoinAndSelect('room.contracts', 'contracts');
    query.leftJoinAndSelect('room.feedbacks', 'feedbacks');
    query.orderBy('room.createdAt', 'DESC');

    return query.getMany();
  }

  async updateStatus(id: string, status: RoomStatus): Promise<Room> {
    const room = await this.findOne(id);
    room.status = status;
    return this.roomRepository.save(room);
  }
}