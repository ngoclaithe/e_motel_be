import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    ContractRequest,
    ContractRequestStatus,
    ContractRequestInitiator,
} from './entities/contract-request.entity';
import {
    CreateContractRequestDto,
    RespondToContractRequestDto,
    UpdateContractRequestDto,
} from './dto/contract-request.dto';
import { Room, RoomStatus } from '../room/entities/room.entity';
import { Motel } from '../motel/entities/motel.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { ContractService } from './contract.service';
import { ContractType } from './entities/contract.entity';

import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ContractRequestService {
    constructor(
        @InjectRepository(ContractRequest)
        private readonly contractRequestRepository: Repository<ContractRequest>,
        @InjectRepository(Room)
        private readonly roomRepository: Repository<Room>,
        @InjectRepository(Motel)
        private readonly motelRepository: Repository<Motel>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly contractService: ContractService,
        private readonly notificationService: NotificationService,
    ) { }

    async create(userId: string, userRole: UserRole, dto: CreateContractRequestDto) {
        // ... (existing helper logic)
        let room: Room = null;
        let motel: Motel = null;
        let landlordId: string;
        let initiatedBy: ContractRequestInitiator;

        // Validate room or motel
        if (dto.type === ContractType.ROOM) {
            if (!dto.roomId) {
                throw new BadRequestException('roomId is required for ROOM contract request');
            }

            room = await this.roomRepository.findOne({
                where: { id: dto.roomId },
                relations: ['owner'],
            });

            if (!room) {
                throw new NotFoundException('Room not found');
            }

            if (room.status === RoomStatus.OCCUPIED) {
                throw new BadRequestException('Room is already occupied');
            }

            landlordId = room.ownerId;
        } else if (dto.type === ContractType.MOTEL) {
            if (!dto.motelId) {
                throw new BadRequestException('motelId is required for MOTEL contract request');
            }

            motel = await this.motelRepository.findOne({
                where: { id: dto.motelId },
                relations: ['owner'],
            });

            if (!motel) {
                throw new NotFoundException('Motel not found');
            }

            landlordId = motel.ownerId;
        } else {
            throw new BadRequestException('Invalid contract type');
        }

        // Validate tenant exists
        const tenant = await this.userRepository.findOne({
            where: { id: dto.tenantId },
        });

        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }

        // Determine who initiated
        if (userId === landlordId) {
            initiatedBy = ContractRequestInitiator.LANDLORD;
        } else if (userId === dto.tenantId) {
            initiatedBy = ContractRequestInitiator.TENANT;
        } else {
            throw new ForbiddenException('You must be either the landlord or the tenant');
        }

        // Validate dates
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        if (endDate <= startDate) {
            throw new BadRequestException('End date must be after start date');
        }

        // Create request
        const request = this.contractRequestRepository.create({
            type: dto.type,
            roomId: dto.roomId || null,
            motelId: dto.motelId || null,
            landlordId,
            tenantId: dto.tenantId,
            initiatedBy,
            startDate,
            endDate,
            monthlyRent: dto.monthlyRent,
            deposit: dto.deposit,
            electricityCostPerKwh: dto.electricityCostPerKwh,
            waterCostPerCubicMeter: dto.waterCostPerCubicMeter,
            internetCost: dto.internetCost,
            parkingCost: dto.parkingCost,
            serviceFee: dto.serviceFee,
            specialTerms: dto.specialTerms,
            message: dto.message,
            status: ContractRequestStatus.PENDING,
        });

        const savedRequest = await this.contractRequestRepository.save(request);

        // Notify
        const targetUserId = initiatedBy === ContractRequestInitiator.LANDLORD ? dto.tenantId : landlordId;
        const msg = initiatedBy === ContractRequestInitiator.LANDLORD
            ? `Bạn nhận được yêu cầu ký hợp đồng mới từ chủ trọ cho ${room ? 'phòng ' + room.number : 'nhà trọ ' + motel.name}`
            : `Bạn nhận được yêu cầu thuê ${room ? 'phòng ' + room.number : 'nhà trọ ' + motel.name} từ ${tenant.lastName} ${tenant.firstName}`;

        await this.notificationService.create({
            title: 'Yêu cầu hợp đồng mới',
            message: msg,
            toUserId: targetUserId,
        }, userId);

        return savedRequest;
    }

    // ... findAllForUser and findOne (unchanged)

    async findAllForUser(userId: string, userRole: UserRole) {
        const qb = this.contractRequestRepository
            .createQueryBuilder('request')
            .leftJoinAndSelect('request.room', 'room')
            .leftJoinAndSelect('request.motel', 'motel')
            .leftJoinAndSelect('request.landlord', 'landlord')
            .leftJoinAndSelect('request.tenant', 'tenant')
            .leftJoinAndSelect('request.contract', 'contract');

        if (userRole === UserRole.ADMIN) {
            // Admin can see all
        } else {
            // Regular users see requests where they are involved
            qb.where('request.landlordId = :userId OR request.tenantId = :userId', {
                userId,
            });
        }

        qb.orderBy('request.createdAt', 'DESC');

        return qb.getMany();
    }

    async findOne(id: string, userId: string, userRole: UserRole) {
        const request = await this.contractRequestRepository.findOne({
            where: { id },
            relations: ['room', 'motel', 'landlord', 'tenant', 'contract'],
        });

        if (!request) {
            return null;
        }

        // Check permission
        if (
            userRole !== UserRole.ADMIN &&
            request.landlordId !== userId &&
            request.tenantId !== userId
        ) {
            throw new ForbiddenException('No permission to view this request');
        }

        return request;
    }

    async approve(
        id: string,
        userId: string,
        userRole: UserRole,
        responseDto: RespondToContractRequestDto,
    ) {
        const request = await this.findOne(id, userId, userRole);
        if (!request) {
            throw new NotFoundException('Contract request not found');
        }

        if (request.status !== ContractRequestStatus.PENDING) {
            throw new BadRequestException('Request is not pending');
        }

        // Only the non-initiator can approve
        if (request.initiatedBy === ContractRequestInitiator.LANDLORD) {
            if (request.tenantId !== userId && userRole !== UserRole.ADMIN) {
                throw new ForbiddenException('Only the tenant can approve this request');
            }
        } else {
            if (request.landlordId !== userId && userRole !== UserRole.ADMIN) {
                throw new ForbiddenException('Only the landlord can approve this request');
            }
        }

        // Verify room/motel is still available
        if (request.type === ContractType.ROOM && request.roomId) {
            const room = await this.roomRepository.findOne({
                where: { id: request.roomId },
            });

            if (!room) {
                throw new NotFoundException('Room not found');
            }

            if (room.status === RoomStatus.OCCUPIED) {
                throw new BadRequestException('Room is no longer available');
            }
        }

        // Create the contract
        const contract = await this.contractService.create({
            type: request.type,
            roomId: request.roomId,
            motelId: request.motelId,
            tenantId: request.tenantId,
            startDate: request.startDate.toISOString(),
            endDate: request.endDate.toISOString(),
            monthlyRent: request.monthlyRent,
            deposit: request.deposit,
            electricityCostPerKwh: request.electricityCostPerKwh,
            waterCostPerCubicMeter: request.waterCostPerCubicMeter,
            internetCost: request.internetCost,
            parkingCost: request.parkingCost,
            serviceFee: request.serviceFee,
            specialTerms: request.specialTerms,
        });

        // Update request
        request.status = ContractRequestStatus.APPROVED;
        request.responseMessage = responseDto.responseMessage;
        request.respondedAt = new Date();
        request.contractId = contract.id;

        const savedRequest = await this.contractRequestRepository.save(request);

        // Notify Initiator
        const initiatorId = request.initiatedBy === ContractRequestInitiator.LANDLORD ? request.landlordId : request.tenantId;
        await this.notificationService.create({
            title: 'Yêu cầu hợp đồng được chấp nhận',
            message: `Yêu cầu hợp đồng của bạn đã được chấp nhận. Hợp đồng mới đã được tạo.`,
            toUserId: initiatorId,
        }, userId);

        return savedRequest;
    }

    async reject(
        id: string,
        userId: string,
        userRole: UserRole,
        responseDto: RespondToContractRequestDto,
    ) {
        const request = await this.findOne(id, userId, userRole);
        if (!request) {
            throw new NotFoundException('Contract request not found');
        }

        if (request.status !== ContractRequestStatus.PENDING) {
            throw new BadRequestException('Request is not pending');
        }

        // Only the non-initiator can reject
        if (request.initiatedBy === ContractRequestInitiator.LANDLORD) {
            if (request.tenantId !== userId && userRole !== UserRole.ADMIN) {
                throw new ForbiddenException('Only the tenant can reject this request');
            }
        } else {
            if (request.landlordId !== userId && userRole !== UserRole.ADMIN) {
                throw new ForbiddenException('Only the landlord can reject this request');
            }
        }

        request.status = ContractRequestStatus.REJECTED;
        request.responseMessage = responseDto.responseMessage;
        request.respondedAt = new Date();

        const savedRequest = await this.contractRequestRepository.save(request);

        // Notify Initiator
        const initiatorId = request.initiatedBy === ContractRequestInitiator.LANDLORD ? request.landlordId : request.tenantId;
        await this.notificationService.create({
            title: 'Yêu cầu hợp đồng bị từ chối',
            message: `Yêu cầu hợp đồng của bạn đã bị từ chối. Lý do: ${request.responseMessage}`,
            toUserId: initiatorId,
        }, userId);

        return savedRequest;
    }

    async cancel(id: string, userId: string, userRole: UserRole) {
        const request = await this.findOne(id, userId, userRole);
        if (!request) {
            throw new NotFoundException('Contract request not found');
        }

        if (request.status !== ContractRequestStatus.PENDING) {
            throw new BadRequestException('Can only cancel pending requests');
        }

        // Only the initiator can cancel
        if (request.initiatedBy === ContractRequestInitiator.LANDLORD) {
            if (request.landlordId !== userId && userRole !== UserRole.ADMIN) {
                throw new ForbiddenException('Only the initiator can cancel this request');
            }
        } else {
            if (request.tenantId !== userId && userRole !== UserRole.ADMIN) {
                throw new ForbiddenException('Only the initiator can cancel this request');
            }
        }

        request.status = ContractRequestStatus.CANCELLED;
        const savedRequest = await this.contractRequestRepository.save(request);

        // Notify Not-Initiator (Receiver)
        const receiverId = request.initiatedBy === ContractRequestInitiator.LANDLORD ? request.tenantId : request.landlordId;
        await this.notificationService.create({
            title: 'Yêu cầu hợp đồng đã bị hủy',
            message: `Yêu cầu hợp đồng đã bị hủy bởi người gửi.`,
            toUserId: receiverId,
        }, userId);

        return savedRequest;
    }

    async update(
        id: string,
        userId: string,
        userRole: UserRole,
        updateDto: UpdateContractRequestDto,
    ) {
        const request = await this.findOne(id, userId, userRole);
        if (!request) {
            throw new NotFoundException('Contract request not found');
        }

        if (request.status !== ContractRequestStatus.PENDING) {
            throw new BadRequestException('Can only update pending requests');
        }

        // Only the initiator can update
        if (request.initiatedBy === ContractRequestInitiator.LANDLORD) {
            if (request.landlordId !== userId && userRole !== UserRole.ADMIN) {
                throw new ForbiddenException('Only the initiator can update this request');
            }
        } else {
            if (request.tenantId !== userId && userRole !== UserRole.ADMIN) {
                throw new ForbiddenException('Only the initiator can update this request');
            }
        }

        // Validate dates if provided
        if (updateDto.startDate || updateDto.endDate) {
            const startDate = updateDto.startDate
                ? new Date(updateDto.startDate)
                : request.startDate;
            const endDate = updateDto.endDate ? new Date(updateDto.endDate) : request.endDate;

            if (endDate <= startDate) {
                throw new BadRequestException('End date must be after start date');
            }
        }

        Object.assign(request, updateDto);
        return this.contractRequestRepository.save(request);
    }
}
