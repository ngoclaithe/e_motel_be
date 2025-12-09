import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { CreateBillDto, UpdateBillDto } from './dto/bill.dto';
import { Contract } from '../contract/entities/contract.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly mailService: MailService,
  ) { }

  async create(dto: CreateBillDto) {
    const contract = await this.contractRepository.findOne({ where: { id: dto.contractId }, relations: ['tenant'] });
    if (!contract) throw new NotFoundException('Contract not found');

    const totalElectric = (dto.electricityEnd - dto.electricityStart) * dto.electricityRate;
    const totalWater = (dto.waterEnd - dto.waterStart) * dto.waterRate;
    const other = dto.otherFees || 0;
    const total = totalElectric + totalWater + other;

    const bill = this.billRepository.create({
      ...dto,
      totalAmount: total,
      isPaid: false,
    });

    const saved = await this.billRepository.save(bill);

    // notify tenant by email
    if (contract.tenant && contract.tenant.email) {
      await this.mailService.sendBillNotification(contract.tenant.email, { month: dto.month, totalAmount: total, dueDate: dto.month });
    }

    return saved;
  }

  async findAll(user?: any) {
    const bills = await this.billRepository.find({
      relations: ['contract', 'contract.tenant']
    });

    // If tenant, only return bills for contracts where they are the tenant
    if (user && user.role === 'TENANT') {
      return bills.filter(bill => bill.contract?.tenantId === user.id);
    }

    // Admin and Landlord see all bills
    return bills;
  }

  async findOne(id: string) {
    const bill = await this.billRepository.findOne({ where: { id }, relations: ['contract'] });
    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }

  async markPaid(id: string) {
    const bill = await this.findOne(id);
    bill.isPaid = true;
    bill.paidAt = new Date();
    return this.billRepository.save(bill);
  }

  async update(id: string, dto: UpdateBillDto) {
    const bill = await this.findOne(id);
    Object.assign(bill, dto);
    return this.billRepository.save(bill);
  }
}