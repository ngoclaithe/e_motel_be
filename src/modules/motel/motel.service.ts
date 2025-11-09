import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Motel, AlleyType, SecurityType } from './entities/motel.entity';
import { Image } from '../image/entities/image.entity';
import { CreateMotelDto, UpdateMotelDto, FilterMotelDto } from './dto/motel.dto';
import { UserRole } from '../user/entities/user.entity';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class MotelService {
  constructor(
    @InjectRepository(Motel)
    private readonly motelRepository: Repository<Motel>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private validateImageUrls(urls: string[]): void {
    const invalidUrls = urls.filter(url => !this.isValidUrl(url));
    if (invalidUrls.length > 0) {
      throw new BadRequestException(`Invalid image URLs: ${invalidUrls.join(', ')}`);
    }
  }

  async create(userId: string, createMotelDto: CreateMotelDto): Promise<Motel> {
    const { images, ...motelData } = createMotelDto;

    if (images && images.length > 0) {
      this.validateImageUrls(images);
    }

    const motel = this.motelRepository.create({
      ...motelData,
      ownerId: userId,
    });

    const savedMotel = await this.motelRepository.save(motel);

    if (images && images.length > 0) {
      const imageEntities = images.map(url => 
        this.imageRepository.create({
          url,
          motelId: savedMotel.id,
        })
      );
      await this.imageRepository.save(imageEntities);
    }

    return this.findOne(savedMotel.id);
  }

  async findAll(filterDto?: FilterMotelDto): Promise<PaginatedResult<Motel>> {
    const {
      page = 1,
      limit = 10,
      search,
      minPrice,
      maxPrice,
      alleyType,
      securityType,
      hasWifi,
      hasParking,
      hasElevator,
      allowPets,
      allowCooking,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto || {};

    const where: any = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (alleyType) {
      where.alleyType = alleyType;
    }

    if (securityType) {
      where.securityType = securityType;
    }

    if (hasWifi !== undefined) {
      where.hasWifi = hasWifi;
    }
    if (hasParking !== undefined) {
      where.hasParking = hasParking;
    }
    if (hasElevator !== undefined) {
      where.hasElevator = hasElevator;
    }
    if (allowPets !== undefined) {
      where.allowPets = allowPets;
    }
    if (allowCooking !== undefined) {
      where.allowCooking = allowCooking;
    }

    const queryBuilder = this.motelRepository
      .createQueryBuilder('motel')
      .leftJoinAndSelect('motel.owner', 'owner')
      .leftJoinAndSelect('motel.images', 'images');

    if (search) {
      queryBuilder.where(
        '(motel.name LIKE :search OR motel.address LIKE :search OR motel.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (alleyType) {
      queryBuilder.andWhere('motel.alleyType = :alleyType', { alleyType });
    }
    if (securityType) {
      queryBuilder.andWhere('motel.securityType = :securityType', { securityType });
    }
    if (hasWifi !== undefined) {
      queryBuilder.andWhere('motel.hasWifi = :hasWifi', { hasWifi });
    }
    if (hasParking !== undefined) {
      queryBuilder.andWhere('motel.hasParking = :hasParking', { hasParking });
    }
    if (hasElevator !== undefined) {
      queryBuilder.andWhere('motel.hasElevator = :hasElevator', { hasElevator });
    }
    if (allowPets !== undefined) {
      queryBuilder.andWhere('motel.allowPets = :allowPets', { allowPets });
    }
    if (allowCooking !== undefined) {
      queryBuilder.andWhere('motel.allowCooking = :allowCooking', { allowCooking });
    }

    const validSortFields = ['createdAt', 'updatedAt', 'name', 'totalRooms'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`motel.${sortField}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');

    const total = await queryBuilder.getCount();

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Motel> {
    const motel = await this.motelRepository.findOne({
      where: { id },
      relations: ['owner', 'images'],
    });

    if (!motel) {
      throw new NotFoundException(`Motel with ID ${id} not found`);
    }

    return motel;
  }

  async update(
    id: string,
    userId: string,
    userRole: UserRole,
    updateMotelDto: UpdateMotelDto,
  ): Promise<Motel> {
    const motel = await this.findOne(id);

    if (userRole !== UserRole.ADMIN && motel.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this motel');
    }

    const { images, ...motelData } = updateMotelDto;

    Object.assign(motel, motelData);
    await this.motelRepository.save(motel);

    if (images !== undefined) {
      if (images.length > 0) {
        this.validateImageUrls(images);
      }

      await this.imageRepository.delete({ motelId: id });

      if (images.length > 0) {
        const imageEntities = images.map(url =>
          this.imageRepository.create({
            url,
            motelId: id,
          })
        );
        await this.imageRepository.save(imageEntities);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const motel = await this.findOne(id);

    if (userRole !== UserRole.ADMIN && motel.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this motel');
    }

    await this.imageRepository.delete({ motelId: id });

    await this.motelRepository.remove(motel);
  }

  async findByOwner(ownerId: string): Promise<Motel[]> {
    return this.motelRepository.find({
      where: { ownerId },
      relations: ['images'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}