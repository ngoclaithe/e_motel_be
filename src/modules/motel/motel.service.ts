import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Motel } from './entities/motel.entity';
import { Image } from '../image/entities/image.entity';
import { CreateMotelDto, UpdateMotelDto } from './dto/motel.dto';
import { UserRole } from '../user/entities/user.entity';

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
    const { images, logo, ...motelData } = createMotelDto;

    // Validate logo URL if provided
    if (logo && !this.isValidUrl(logo)) {
      throw new BadRequestException('Invalid logo URL');
    }

    // Validate image URLs if provided
    if (images && images.length > 0) {
      this.validateImageUrls(images);
    }

    // Create motel
    const motel = this.motelRepository.create({
      ...motelData,
      logo,
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

  async findAll(): Promise<Motel[]> {
    return this.motelRepository.find({
      relations: ['owner', 'rooms', 'images'],
      order: {
        createdAt: 'DESC',
      },
    });
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

    const { images, logo, ...motelData } = updateMotelDto;

    // Validate logo URL if provided
    if (logo && !this.isValidUrl(logo)) {
      throw new BadRequestException('Invalid logo URL');
    }

    // Update basic motel information
    Object.assign(motel, {
      ...motelData,
      ...(logo !== undefined && { logo }), // Allow null to remove logo
    });
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