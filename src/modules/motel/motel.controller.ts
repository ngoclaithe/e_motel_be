import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { MotelService } from './motel.service';
import { CreateMotelDto, UpdateMotelDto, FilterMotelDto } from './dto/motel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('motels')
export class MotelController {
  constructor(private readonly motelService: MotelService) { }

  // PUBLIC ROUTES - Không cần token
  @Get()
  findAll(@Query() filterDto: FilterMotelDto) {
    return this.motelService.findAll(filterDto);
  }

  // PROTECTED ROUTES - Cần token
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(@Req() req, @Body() createMotelDto: CreateMotelDto) {
    return this.motelService.create(req.user.id, createMotelDto);
  }

  @Get('my-motels')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  findMyMotels(@Req() req) {
    return this.motelService.findByOwner(req.user.id);
  }

  @Get('s/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.motelService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.motelService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateMotelDto: UpdateMotelDto,
  ) {
    return this.motelService.update(id, req.user.id, req.user.role, updateMotelDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  remove(@Param('id') id: string, @Req() req) {
    return this.motelService.remove(id, req.user.id, req.user.role);
  }
}