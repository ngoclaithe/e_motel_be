import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) { }

    @Get('landlord/revenue')
    @Roles(UserRole.LANDLORD)
    async getRevenue(@Request() req) {
        return this.statisticsService.getLandlordRevenue(req.user.id);
    }

    @Get('landlord/room-status')
    @Roles(UserRole.LANDLORD)
    async getRoomStatus(@Request() req) {
        return this.statisticsService.getLandlordRoomStatus(req.user.id);
    }

    @Get('landlord/overview')
    @Roles(UserRole.LANDLORD)
    async getOverview(@Request() req) {
        return this.statisticsService.getLandlordOverview(req.user.id);
    }

    // ============ ADMIN ENDPOINTS ============

    @Get('admin/overview')
    @Roles(UserRole.ADMIN)
    async getAdminOverview() {
        return this.statisticsService.getAdminOverview();
    }

    @Get('admin/revenue-chart')
    @Roles(UserRole.ADMIN)
    async getAdminRevenueChart() {
        return this.statisticsService.getAdminRevenueChart();
    }

    @Get('admin/user-growth')
    @Roles(UserRole.ADMIN)
    async getAdminUserGrowth() {
        return this.statisticsService.getAdminUserGrowth();
    }

    @Get('admin/contract-status')
    @Roles(UserRole.ADMIN)
    async getAdminContractStatus() {
        return this.statisticsService.getAdminContractStatus();
    }

    @Get('admin/occupancy-rate')
    @Roles(UserRole.ADMIN)
    async getAdminOccupancyRate() {
        return this.statisticsService.getAdminOccupancyRate();
    }
}
