import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './entities/contract.entity';
import { CreateContractDto, UpdateContractDto } from './dto/contract.dto';
import { Room, RoomStatus } from '../room/entities/room.entity';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async create(createDto: CreateContractDto) {
    const room = await this.roomRepository.findOne({ where: { id: createDto.roomId }, relations: ['motel'] });
    if (!room) throw new NotFoundException('Room not found');

    const contract = this.contractRepository.create({
      ...createDto,
    });

  // mark room as occupied
  room.status = RoomStatus.OCCUPIED;
    await this.roomRepository.save(room);

    return this.contractRepository.save(contract);
  }

  async findAll() {
    return this.contractRepository.find({ relations: ['room', 'tenant', 'bills'] });
  }

  async findOne(id: string) {
    const contract = await this.contractRepository.findOne({ where: { id }, relations: ['room', 'tenant', 'bills'] });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async update(id: string, userId: string, userRole: UserRole, updateDto: UpdateContractDto) {
    const contract = await this.findOne(id);
    if (userRole !== UserRole.ADMIN && contract.room.motel.ownerId !== userId) {
      throw new ForbiddenException('No permission');
    }
    Object.assign(contract, updateDto);
    return this.contractRepository.save(contract);
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const contract = await this.findOne(id);
    if (userRole !== UserRole.ADMIN && contract.room.motel.ownerId !== userId) {
      throw new ForbiddenException('No permission');
    }
  // free room
  contract.room.status = RoomStatus.VACANT;
    await this.roomRepository.save(contract.room);
    await this.contractRepository.remove(contract);
  }
}