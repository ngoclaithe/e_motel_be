import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { MotelService } from './motel.service';
import { CreateMotelDto, UpdateMotelDto } from './dto/motel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('motels')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MotelController {
  constructor(private readonly motelService: MotelService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(@Req() req, @Body() createMotelDto: CreateMotelDto) {
    return this.motelService.create(req.user.id, createMotelDto);
  }

  @Get()
  findAll() {
    return this.motelService.findAll();
  }

  @Get('my-motels')
  @Roles(UserRole.LANDLORD)
  findMyMotels(@Req() req) {
    return this.motelService.findByOwner(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.motelService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateMotelDto: UpdateMotelDto,
  ) {
    return this.motelService.update(id, req.user.id, req.user.role, updateMotelDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  remove(@Param('id') id: string, @Req() req) {
    return this.motelService.remove(id, req.user.id, req.user.role);
  }
}