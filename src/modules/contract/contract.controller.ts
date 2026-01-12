import {
  Controller, Post, Get, Put, Delete, Body, Param,
  UseGuards, Req, Res
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto, UpdateContractDto } from './dto/contract.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { Response } from 'express';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractController {
  constructor(private readonly contractService: ContractService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(@Body() dto: CreateContractDto) {
    return this.contractService.create(dto);
  }

  @Get()
  findAll(@Req() req) {
    return this.contractService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  update(@Param('id') id: string, @Req() req, @Body() dto: UpdateContractDto) {
    return this.contractService.update(id, req.user.id, req.user.role, dto);
  }

  @Post(':id/approve')
  @Roles(UserRole.TENANT)
  approve(@Param('id') id: string, @Req() req) {
    return this.contractService.approve(id, req.user.id);
  }

  @Post(':id/terminate')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  terminate(@Param('id') id: string, @Req() req) {
    return this.contractService.terminate(id, req.user.id, req.user.role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Req() req) {
    return this.contractService.remove(id, req.user.id, req.user.role);
  }

  @Get(':id/download')
  download(@Param('id') id: string, @Res() res: Response) {
    return this.contractService.generateContractPdf(id, res);
  }
}
