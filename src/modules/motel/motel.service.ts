import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Motel } from './entities/motel.entity';
import { Image } from '../image/entities/image.entity';
import { CreateMotelDto, UpdateMotelDto } from './dto/motel.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class MotelService {
  constructor(
    @InjectRepository(Motel)
    private readonly motelRepository: Repository<Motel>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(userId: string, createMotelDto: CreateMotelDto): Promise<Motel> {
    // avoid passing raw image URLs array into entity.create (TypeORM expects Image[])
    const { images, ...motelData } = createMotelDto as any;
    const motel: Partial<Motel> = this.motelRepository.create({
      ...(motelData as any),
      ownerId: userId,
    } as any) as Partial<Motel>;

    // Handle logo upload if provided as base64
    if (createMotelDto.logo && createMotelDto.logo.startsWith('data:image')) {
      const uploadResult = await this.cloudinaryService.uploadImage(createMotelDto.logo);
      motel.logo = uploadResult.url;
    }

    // Save the motel first to get the ID
  const savedMotel = (await this.motelRepository.save(motel)) as Motel;

    // Handle multiple images if provided (upload then create Image entities)
    if (images && images.length > 0) {
      const imagePromises = images.map(async (imageData: string) => {
        if (imageData.startsWith('data:image')) {
          const uploadResult = await this.cloudinaryService.uploadImage(imageData);
          const image = this.imageRepository.create({
            url: uploadResult.url,
            motelId: savedMotel.id,
          });
          return this.imageRepository.save(image);
        } else {
          const image = this.imageRepository.create({ url: imageData, motelId: savedMotel.id });
          return this.imageRepository.save(image);
        }
      });

      await Promise.all(imagePromises);
    }

    return this.findOne(savedMotel.id);
  }

  async findAll(): Promise<Motel[]> {
    return this.motelRepository.find({
      relations: ['owner', 'rooms', 'images'],
    });
  }

  async findOne(id: string): Promise<Motel> {
    const motel = await this.motelRepository.findOne({
      where: { id },
      relations: ['owner', 'rooms', 'images'],
    });

    if (!motel) {
      throw new NotFoundException('Motel not found');
    }

    return motel;
  }

  async update(id: string, userId: string, userRole: UserRole, updateMotelDto: UpdateMotelDto): Promise<Motel> {
    const motel = await this.findOne(id);

    // Check if user has permission to update
    if (userRole !== UserRole.ADMIN && motel.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this motel');
    }

    // Handle logo update if provided
    if (updateMotelDto.logo && updateMotelDto.logo.startsWith('data:image')) {
      const uploadResult = await this.cloudinaryService.uploadImage(updateMotelDto.logo);
      updateMotelDto.logo = uploadResult.url;
    }

    // Update basic motel information
    Object.assign(motel, updateMotelDto);
    await this.motelRepository.save(motel);

    // Handle images update if provided
    if (updateMotelDto.images && updateMotelDto.images.length > 0) {
      // Remove existing images
      await this.imageRepository.delete({ motelId: id });

      // Upload and save new images
      const imagePromises = updateMotelDto.images.map(async (imageData) => {
        if (imageData.startsWith('data:image')) {
          const uploadResult = await this.cloudinaryService.uploadImage(imageData);
          const image = this.imageRepository.create({
            url: uploadResult.url,
            motelId: id,
          });
          return this.imageRepository.save(image);
        }
      });

      await Promise.all(imagePromises);
    }

    return this.findOne(id);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const motel = await this.findOne(id);

    if (userRole !== UserRole.ADMIN && motel.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this motel');
    }

    await this.motelRepository.remove(motel);
  }

  async findByOwner(ownerId: string): Promise<Motel[]> {
    return this.motelRepository.find({
      where: { ownerId },
      relations: ['rooms', 'images'],
    });
  }
}