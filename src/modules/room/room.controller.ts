import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { RoomStatus } from './entities/room.entity';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) { }

  // PUBLIC ROUTES

  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Get('vacant')
  findVacant() {
    return this.roomService.findVacant();
  }

  // Route tĩnh phải đặt TRƯỚC route động
  @Get('my-rooms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD, UserRole.ADMIN, UserRole.TENANT)
  findMyRooms(@Req() req, @Query('status') status?: RoomStatus) {
    return this.roomService.findMyRooms(req.user.id, req.user.role, status);
  }

  // Route động – đặt SAU các route tĩnh
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  // PROTECTED ROUTES

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(@Body() createRoomDto: CreateRoomDto, @Req() req) {
    return this.roomService.create(createRoomDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.update(id, req.user.id, req.user.role, updateRoomDto);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  updateStatus(@Param('id') id: string, @Body('status') status: RoomStatus) {
    return this.roomService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  remove(@Param('id') id: string, @Req() req) {
    return this.roomService.remove(id, req.user.id, req.user.role);
  }
}
