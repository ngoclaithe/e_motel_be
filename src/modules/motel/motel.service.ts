import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Motel, AlleyType, SecurityType } from './entities/motel.entity';
import { Image } from '../image/entities/image.entity';
import { CreateMotelDto, UpdateMotelDto, FilterMotelDto } from './dto/motel.dto';
import { UserRole } from '../user/entities/user.entity';
import slugify from 'slugify';

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
  ) { }

  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
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

  async create(userId: string, createMotelDto: CreateMotelDto): Promise<Motel> {
    const { images, ...motelData } = createMotelDto;

    if (images && images.length > 0) {
      this.validateImageUrls(images);
    }

    const motel = this.motelRepository.create({
      ...motelData,
      ownerId: userId,
      slug: this.generateSlug(motelData.name),
    });

    const savedMotel = await this.motelRepository.save(motel);

    if (images && images.length > 0) {
      const imageEntities = images.map((url) =>
        this.imageRepository.create({
          url,
          motelId: savedMotel.id,
        }),
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

    const queryBuilder = this.motelRepository
      .createQueryBuilder('motel')
      .leftJoinAndSelect('motel.owner', 'owner')
      .leftJoinAndSelect('motel.images', 'images');

    if (search) {
      queryBuilder.where(
        '(motel.name LIKE :search OR motel.address LIKE :search OR motel.description LIKE :search)',
        { search: `%${search}%` },
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

    if (minPrice !== undefined || maxPrice !== undefined) {
      queryBuilder.andWhere('rooms.price IS NOT NULL');
      if (minPrice !== undefined) {
        queryBuilder.andWhere('rooms.price >= :minPrice', { minPrice });
      }
      if (maxPrice !== undefined) {
        queryBuilder.andWhere('rooms.price <= :maxPrice', { maxPrice });
      }
    }

    // totalRooms là column trên Motel nên vẫn sort bình thường
    const validSortFields = ['createdAt', 'updatedAt', 'name', 'totalRooms', 'monthlyRent'];
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

  async findBySlug(slug: string): Promise<Motel> {
    let motel = await this.motelRepository.findOne({
      where: { slug },
      relations: ['owner', 'images'],
    });

    if (!motel) {
      // Kiểm tra nếu slug truyền vào có định dạng UUID thì tìm theo ID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

      try {
        if (isUuid) {
          motel = await this.findOne(slug);
        } else {
          // Thử tìm theo ID nếu k phải UUID (dữ liệu cũ khác)
          motel = await this.motelRepository.findOne({
            where: { id: slug as any },
            relations: ['owner', 'images'],
          });
        }
      } catch (e) {
        throw new NotFoundException(`Motel with slug or ID ${slug} not found`);
      }
    }

    if (!motel) {
      throw new NotFoundException(`Motel with slug or ID ${slug} not found`);
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

    if (motelData.name && motelData.name !== motel.name) {
      motel.slug = this.generateSlug(motelData.name);
    }

    Object.assign(motel, motelData);
    await this.motelRepository.save(motel);

    if (images !== undefined) {
      if (images.length > 0) {
        this.validateImageUrls(images);
      }

      await this.imageRepository.delete({ motelId: id });

      if (images.length > 0) {
        const imageEntities = images.map((url) =>
          this.imageRepository.create({
            url,
            motelId: id,
          }),
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
      relations: ['images', 'owner'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
