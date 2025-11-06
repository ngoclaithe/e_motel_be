import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['ownedMotels', 'rentedRooms', 'contracts', 'feedbacks'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByPhone(phone: string): Promise<User[]> {
    if (!phone || phone.trim() === '') {
      throw new NotFoundException('Phone number is required');
    }

    const users = await this.userRepository.find({
      where: { phoneNumber: Like(`%${phone}%`) },
      select: ['id', 'firstName', 'lastName', 'phoneNumber', 'role'],
    });

    if (users.length === 0) {
      throw new NotFoundException('No user found with this phone number');
    }

    return users;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // If avatar is provided as base64, upload to Cloudinary
    if (updateUserDto.avatar && updateUserDto.avatar.startsWith('data:image')) {
      const uploadResult = await this.cloudinaryService.uploadImage(updateUserDto.avatar);
      updateUserDto.avatar = uploadResult.url;
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }

  async findLandlords(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.LANDLORD },
      relations: ['ownedMotels'],
    });
  }

  async findTenants(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.TENANT },
      relations: ['rentedRooms', 'contracts'],
    });
  }

  async getProfile(id: string): Promise<User> {
    return this.findById(id);
  }
}