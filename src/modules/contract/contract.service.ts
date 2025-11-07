import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractStatus, ContractType } from './entities/contract.entity';
import { CreateContractDto, UpdateContractDto } from './dto/contract.dto';
import { Room, RoomStatus } from '../room/entities/room.entity';
import { Motel } from '../motel/entities/motel.entity';
import { User, UserRole } from '../user/entities/user.entity';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Motel)
    private readonly motelRepository: Repository<Motel>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createDto: CreateContractDto) {
    let room: Room = null;
    let motel: Motel = null;
    let owner: User = null;
    let ownerId: string;

    if (createDto.type === ContractType.ROOM) {
      if (!createDto.roomId) {
        throw new BadRequestException('roomId is required for ROOM contract');
      }

      room = await this.roomRepository.findOne({ 
        where: { id: createDto.roomId }, 
        relations: ['owner'] 
      });
      
      if (!room) {
        throw new NotFoundException('Room not found');
      }

      if (room.status === RoomStatus.OCCUPIED) {
        throw new BadRequestException('Room is already occupied');
      }

      ownerId = room.ownerId;
      owner = room.owner;

    } else if (createDto.type === ContractType.MOTEL) {
      if (!createDto.motelId) {
        throw new BadRequestException('motelId is required for MOTEL contract');
      }

      motel = await this.motelRepository.findOne({ 
        where: { id: createDto.motelId }, 
        relations: ['owner'] 
      });
      
      if (!motel) {
        throw new NotFoundException('Motel not found');
      }

      
      ownerId = motel.ownerId;
      owner = motel.owner;
    } else {
      throw new BadRequestException('Invalid contract type');
    }

    // Load tenant info
    const tenant = await this.userRepository.findOne({ 
      where: { id: createDto.tenantId } 
    });
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Validate dates
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Prepare contract data với defaults từ room hoặc motel
    const contractData = {
      type: createDto.type,
      roomId: createDto.roomId || null,
      motelId: createDto.motelId || null,
      tenantId: createDto.tenantId,
      startDate,
      endDate,
      monthlyRent: createDto.monthlyRent,
      deposit: createDto.deposit,
      paymentCycleMonths: createDto.paymentCycleMonths ?? (room?.paymentCycleMonths || motel?.paymentCycleMonths || 1),
      depositMonths: createDto.depositMonths ?? (room?.depositMonths || motel?.depositMonths || 1),
      paymentDay: createDto.paymentDay ?? 5,
      maxOccupants: createDto.maxOccupants ?? (room?.maxOccupancy || (motel ? motel.totalRooms * 4 : 2)),
      
      // Service costs - priority: DTO > Room > Motel
      electricityCostPerKwh: createDto.electricityCostPerKwh ?? (room?.electricityCostPerKwh || motel?.electricityCostPerKwh),
      waterCostPerCubicMeter: createDto.waterCostPerCubicMeter ?? (room?.waterCostPerCubicMeter || motel?.waterCostPerCubicMeter),
      internetCost: createDto.internetCost ?? (room?.internetCost || motel?.internetCost),
      parkingCost: createDto.parkingCost ?? (room?.parkingCost || motel?.parkingCost),
      serviceFee: createDto.serviceFee ?? room?.serviceFee,
      
      // Services availability
      hasWifi: room?.hasWifi || motel?.hasWifi,
      hasParking: motel?.hasParking,
      
      // Additional info
      specialTerms: createDto.specialTerms,
      regulations: motel?.regulations,
      status: ContractStatus.ACTIVE,
    };

    const contract = this.contractRepository.create(contractData);

    // Generate contract document
    contract.documentContent = this.generateContractDocument(contract, room, motel, owner, tenant);

    // Save contract
    const savedContract = await this.contractRepository.save(contract);

    // Update status
    if (createDto.type === ContractType.ROOM && room) {
      room.status = RoomStatus.OCCUPIED;
      room.tenantId = createDto.tenantId;
      await this.roomRepository.save(room);
    } else if (createDto.type === ContractType.MOTEL && motel) {

    }

    return savedContract;
  }

  private generateContractDocument(
    contract: Contract, 
    room: Room | null,
    motel: Motel | null,
    owner: User,
    tenant: User
  ): string {
    const today = new Date();
    const startDate = new Date(contract.startDate);
    const endDate = new Date(contract.endDate);
    
    const durationMonths = Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    const getFullName = (user: User): string => {
      if (user.firstName && user.lastName) {
        return `${user.lastName} ${user.firstName}`;
      }
      if (user.firstName) return user.firstName;
      if (user.lastName) return user.lastName;
      return user.email.split('@')[0];
    };

    const formatMoney = (amount: number) => {
      return amount.toLocaleString('vi-VN') + ' đồng';
    };

    const formatDate = (date: Date) => {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const numberToWords = (num: number): string => {
      return `${formatMoney(num)}`;
    };

    // Build services list
    const services: string[] = [];
    if (contract.electricityCostPerKwh) {
      services.push(`Điện sinh hoạt: ${contract.electricityCostPerKwh.toLocaleString('vi-VN')} đồng/kWh`);
    }
    if (contract.waterCostPerCubicMeter) {
      services.push(`Nước: ${contract.waterCostPerCubicMeter.toLocaleString('vi-VN')} đồng/m³`);
    }
    if (contract.hasWifi && contract.internetCost) {
      services.push(`Internet/Wifi: ${contract.internetCost.toLocaleString('vi-VN')} đồng/tháng`);
    }
    if (contract.hasParking && contract.parkingCost) {
      services.push(`Gửi xe: ${contract.parkingCost.toLocaleString('vi-VN')} đồng/tháng`);
    }
    if (contract.serviceFee) {
      services.push(`Phí dịch vụ (rác, vệ sinh): ${contract.serviceFee.toLocaleString('vi-VN')} đồng/tháng`);
    }

    const servicesText = services.length > 0 
      ? services.join('; ') 
      : 'Không có phí dịch vụ phát sinh';

    let rentalDescription: string;
    let address: string;
    let ownerAddress: string;
    let allowCooking: boolean = false;
    let allowPets: boolean = false;

    if (contract.type === ContractType.ROOM && room) {
      rentalDescription = `01 phòng trọ số ${room.number}`;
      address = owner.phoneNumber || 'Địa chỉ liên hệ với chủ phòng';
      ownerAddress = owner.phoneNumber || 'Thường trú: (Liên hệ qua số điện thoại)';
      allowCooking = room.allowCooking || false;
      allowPets = room.allowPets || false;
      rentalDescription += `\n\n- Diện tích phòng: ${room.area}m²`;
    } else if (motel) {
      rentalDescription = `Toàn bộ nhà trọ ${motel.name}, địa chỉ: ${motel.address}`;
      address = motel.address;
      ownerAddress = motel.address;
      allowCooking = motel.allowCooking || false;
      allowPets = motel.allowPets || false;
      rentalDescription += `\n\n- Tổng số phòng: ${motel.totalRooms} phòng`;
    } else {
      rentalDescription = 'Thông tin chưa đầy đủ';
      address = 'Chưa rõ';
      ownerAddress = 'Chưa rõ';
    }

    const contactPhone = contract.type === ContractType.MOTEL && motel 
      ? (motel.contactPhone || owner.phoneNumber || '................................')
      : (owner.phoneNumber || '................................');

    return `
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập – Tự do – Hạnh phúc
────────────────

HỢP ĐỒNG THUÊ ${contract.type === ContractType.ROOM ? 'PHÒNG TRỌ' : 'NHÀ TRỌ'}

Hôm nay, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}, tại ${address}

Chúng tôi ký tên dưới đây gồm có:

BÊN CHO THUÊ ${contract.type === ContractType.ROOM ? 'PHÒNG TRỌ' : 'NHÀ TRỌ'} (gọi tắt là Bên A):
Ông/Bà: ${getFullName(owner)}
CMND/CCCD số: ${owner.identityCard || '................................'}
Cấp ngày: ..........................
Nơi cấp: ................................
Thường trú tại: ${ownerAddress}
Số điện thoại: ${contactPhone}

BÊN THUÊ ${contract.type === ContractType.ROOM ? 'PHÒNG TRỌ' : 'NHÀ TRỌ'} (gọi tắt là Bên B):
Ông/Bà: ${getFullName(tenant)}
CMND/CCCD số: ${tenant.identityCard || '................................'}
Cấp ngày: ..........................
Nơi cấp: ................................
Thường trú tại: ................................
Số điện thoại: ${tenant.phoneNumber || '................................'}

Sau khi thỏa thuận, hai bên thống nhất như sau:

1. NỘI DUNG THUÊ ${contract.type === ContractType.ROOM ? 'PHÒNG TRỌ' : 'NHÀ TRỌ'}

Bên A đồng ý cho Bên B thuê ${rentalDescription}

- Thời hạn thuê: ${durationMonths} tháng (từ ngày ${formatDate(startDate)} đến ngày ${formatDate(endDate)})
- Giá thuê: ${formatMoney(contract.monthlyRent)}/tháng (Bằng chữ: ${numberToWords(contract.monthlyRent)})
- Tiền đặt cọc: ${formatMoney(contract.deposit)} (Bằng chữ: ${numberToWords(contract.deposit)})
- Chu kỳ thanh toán: ${contract.paymentCycleMonths} tháng, thanh toán vào ngày ${contract.paymentDay} hàng tháng

2. CÁC KHOẢN PHÍ DỊCH VỤ

${servicesText}

3. TRÁCH NHIỆM BÊN A (Bên cho thuê)

- Đảm bảo ${contract.type === ContractType.ROOM ? 'căn phòng' : 'nhà trọ'} cho thuê không có tranh chấp, khiếu kiện.
- Đăng ký với chính quyền địa phương về thủ tục cho thuê ${contract.type === ContractType.ROOM ? 'phòng trọ' : 'nhà trọ'}.
- Cung cấp đầy đủ các dịch vụ đã cam kết trong hợp đồng.
- Thông báo trước ít nhất 30 ngày nếu có thay đổi về giá dịch vụ hoặc nội quy.
- Bảo đảm các thiết bị chung (hành lang, nhà vệ sinh chung nếu có...) hoạt động bình thường.

4. TRÁCH NHIỆM BÊN B (Bên thuê)

- Thanh toán tiền thuê ${contract.type === ContractType.ROOM ? 'phòng' : 'nhà trọ'} đầy đủ, đúng hạn vào ngày ${contract.paymentDay} hàng tháng.
- Đặt cọc với số tiền ${formatMoney(contract.deposit)} khi ký hợp đồng. Số tiền này sẽ được hoàn trả khi kết thúc hợp đồng nếu không có vi phạm và các thiết bị ${contract.type === ContractType.ROOM ? 'trong phòng' : 'trong nhà'} còn nguyên vẹn.
- Đảm bảo bảo quản các thiết bị ${contract.type === ContractType.ROOM ? 'trong phòng' : 'trong nhà trọ'}. Nếu có hư hỏng do lỗi người sử dụng, Bên B phải sửa chữa hoặc bồi thường theo giá thị trường.
- ${contract.type === ContractType.ROOM ? `Chỉ sử dụng phòng trọ vào mục đích ở với số lượng tối đa không quá ${contract.maxOccupants} người (kể cả trẻ em).` : 'Chỉ sử dụng nhà trọ vào mục đích kinh doanh cho thuê phòng trọ hoặc ở.'}
- Không chứa, tàng trữ các chất cháy nổ, hàng cấm, chất gây nghiện.
- Cung cấp giấy tờ tùy thân để đăng ký tạm trú theo quy định pháp luật.
- Giữ gìn an ninh trật tự, vệ sinh chung, nếp sống văn hóa đô thị.
- Không tụ tập đánh bạc, sử dụng ma túy, mại dâm hoặc các hành vi vi phạm pháp luật khác.
- Không được tự ý cải tạo kết cấu ${contract.type === ContractType.ROOM ? 'phòng' : 'nhà'} hoặc trang trí ảnh hưởng đến tường, cột, nền. Nếu có nhu cầu phải trao đổi và được Bên A đồng ý bằng văn bản.
${allowCooking ? '- Được phép nấu ăn trong phòng nhưng phải đảm bảo vệ sinh và an toàn phòng cháy chữa cháy.' : '- Không được nấu ăn trong phòng.'}
${allowPets ? '- Được phép nuôi thú cưng nhưng phải đảm bảo vệ sinh và không gây ảnh hưởng đến người khác.' : '- Không được nuôi thú cưng.'}

5. NỘI QUY VÀ QUY ĐỊNH KHÁC

${contract.regulations || 'Tuân thủ nội quy chung và quy định của pháp luật.'}

${contract.specialTerms ? `\n6. ĐIỀU KHOẢN ĐẶC BIỆT\n\n${contract.specialTerms}\n` : ''}

${contract.specialTerms ? '7' : '6'}. ĐIỀU KHOẢN THỰC HIỆN

- Hai bên cam kết thực hiện đúng các điều khoản đã thỏa thuận.
- Nếu một trong hai bên muốn chấm dứt hợp đồng trước thời hạn phải báo trước cho bên kia ít nhất 30 ngày.
- Nếu Bên B vi phạm hợp đồng (nợ tiền thuê quá 2 tháng, vi phạm nội quy nghiêm trọng...), Bên A có quyền đơn phương chấm dứt hợp đồng và không hoàn trả tiền đặt cọc.
- Mọi tranh chấp phát sinh sẽ được hai bên giải quyết trên tinh thần thiện chí, hòa giải. Nếu không thỏa thuận được sẽ đưa ra cơ quan chức năng giải quyết theo pháp luật.
- Hợp đồng có hiệu lực kể từ ngày ký.
- Hợp đồng được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau.

────────────────

ĐẠI DIỆN BÊN A                                    ĐẠI DIỆN BÊN B
(Ký, ghi rõ họ tên)                              (Ký, ghi rõ họ tên)




${getFullName(owner)}                                             ${getFullName(tenant)}

────────────────
Hợp đồng được tạo tự động ngày ${formatDate(today)}
    `.trim();
  }

  async findAll() {
    return this.contractRepository.find({ 
      relations: ['room', 'room.owner', 'motel', 'motel.owner', 'tenant', 'bills'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string) {
    const contract = await this.contractRepository.findOne({ 
      where: { id }, 
      relations: ['room', 'room.owner', 'motel', 'motel.owner', 'tenant', 'bills'] 
    });
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }
    return contract;
  }

  async update(id: string, userId: string, userRole: UserRole, updateDto: UpdateContractDto) {
    const contract = await this.findOne(id);
    
    const ownerId = contract.room?.ownerId || contract.motel?.ownerId;
    if (userRole !== UserRole.ADMIN && ownerId !== userId) {
      throw new ForbiddenException('No permission to update this contract');
    }

    if (updateDto.startDate || updateDto.endDate) {
      const startDate = updateDto.startDate ? new Date(updateDto.startDate) : contract.startDate;
      const endDate = updateDto.endDate ? new Date(updateDto.endDate) : contract.endDate;
      
      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    Object.assign(contract, updateDto);

    if (updateDto.monthlyRent || updateDto.deposit || updateDto.startDate || updateDto.endDate) {
      const owner = contract.room?.owner || contract.motel?.owner;
      contract.documentContent = this.generateContractDocument(
        contract, 
        contract.room,
        contract.motel,
        owner,
        contract.tenant
      );
    }

    return this.contractRepository.save(contract);
  }

  async terminate(id: string, userId: string, userRole: UserRole) {
    const contract = await this.findOne(id);
    
    const ownerId = contract.room?.ownerId || contract.motel?.ownerId;
    if (userRole !== UserRole.ADMIN && ownerId !== userId) {
      throw new ForbiddenException('No permission to terminate this contract');
    }

    contract.status = ContractStatus.TERMINATED;
    await this.contractRepository.save(contract);

    if (contract.type === ContractType.ROOM && contract.room) {
      contract.room.status = RoomStatus.VACANT;
      contract.room.tenantId = null;
      await this.roomRepository.save(contract.room);
    }

    return contract;
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const contract = await this.findOne(id);
    
    const ownerId = contract.room?.ownerId || contract.motel?.ownerId;
    if (userRole !== UserRole.ADMIN && ownerId !== userId) {
      throw new ForbiddenException('No permission to delete this contract');
    }

    if (contract.bills && contract.bills.length > 0) {
      throw new BadRequestException('Cannot delete contract with existing bills. Please terminate instead.');
    }

    if (contract.type === ContractType.ROOM && contract.room) {
      contract.room.status = RoomStatus.VACANT;
      contract.room.tenantId = null;
      await this.roomRepository.save(contract.room);
    }


    await this.contractRepository.remove(contract);
  }
}