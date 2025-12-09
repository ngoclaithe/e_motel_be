import { Controller, Post, Get, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
import { BillService } from './bill.service';
import { CreateBillDto, UpdateBillDto } from './dto/bill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('bills')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillController {
  constructor(private readonly billService: BillService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(@Body() dto: CreateBillDto) {
    return this.billService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  findAll(@Req() req) {
    return this.billService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billService.findOne(id);
  }

  @Put(':id/pay')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  markPaid(@Param('id') id: string) {
    return this.billService.markPaid(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  update(@Param('id') id: string, @Body() dto: UpdateBillDto) {
    return this.billService.update(id, dto);
  }
}