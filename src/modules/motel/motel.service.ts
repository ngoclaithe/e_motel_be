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

  async create(userId: string, createMotelDto: CreateMotelDto): Promise<Motel> {
    const { images, ...motelData } = createMotelDto;

    // Validate image URLs if provided
    if (images && images.length > 0) {
      this.validateImageUrls(images);
    }

    // Create motel
    const motel = this.motelRepository.create({
      ...motelData,
      ownerId: userId,
    });

    // Save motel
    const savedMotel = await this.motelRepository.save(motel);

    // Create image entities if images provided
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

    // Build where conditions
    const where: any = {};

    // Search by name or address
    if (search) {
      where.name = Like(`%${search}%`);
      // Note: For multiple field search, you'll need to use QueryBuilder
    }

    // Filter by alley type
    if (alleyType) {
      where.alleyType = alleyType;
    }

    // Filter by security type
    if (securityType) {
      where.securityType = securityType;
    }

    // Filter by amenities
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

    // For advanced search with multiple fields or price range from rooms
    const queryBuilder = this.motelRepository
      .createQueryBuilder('motel')
      .leftJoinAndSelect('motel.owner', 'owner')
      .leftJoinAndSelect('motel.rooms', 'rooms')
      .leftJoinAndSelect('motel.images', 'images');

    // Apply search filter
    if (search) {
      queryBuilder.where(
        '(motel.name LIKE :search OR motel.address LIKE :search OR motel.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply filters
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

    // Filter by price range (search in related rooms)
    if (minPrice !== undefined || maxPrice !== undefined) {
      queryBuilder.andWhere('rooms.price IS NOT NULL');
      if (minPrice !== undefined) {
        queryBuilder.andWhere('rooms.price >= :minPrice', { minPrice });
      }
      if (maxPrice !== undefined) {
        queryBuilder.andWhere('rooms.price <= :maxPrice', { maxPrice });
      }
    }

    // Apply sorting
    const validSortFields = ['createdAt', 'updatedAt', 'name', 'totalRooms'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`motel.${sortField}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Get data
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
      relations: ['owner', 'rooms', 'images'],
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

    // Check permission
    if (userRole !== UserRole.ADMIN && motel.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this motel');
    }

    const { images, ...motelData } = updateMotelDto;

    // Update basic motel information
    Object.assign(motel, motelData);
    await this.motelRepository.save(motel);

    // Handle images update if provided
    if (images !== undefined) {
      // Validate URLs
      if (images.length > 0) {
        this.validateImageUrls(images);
      }

      // Remove all existing images
      await this.imageRepository.delete({ motelId: id });

      // Create new images
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

    // Check permission
    if (userRole !== UserRole.ADMIN && motel.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this motel');
    }

    // Delete all related images first
    await this.imageRepository.delete({ motelId: id });

    // Then delete the motel
    await this.motelRepository.remove(motel);
  }

  async findByOwner(ownerId: string): Promise<Motel[]> {
    return this.motelRepository.find({
      where: { ownerId },
      relations: ['rooms', 'images'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}