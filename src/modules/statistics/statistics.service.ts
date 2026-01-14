import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Bill } from '../bill/entities/bill.entity';
import { Room } from '../room/entities/room.entity';
import { Contract, ContractStatus } from '../contract/entities/contract.entity';
import { RoomStatus } from '../room/entities/room.entity';
import { User } from '../user/entities/user.entity';
import { Motel } from '../motel/entities/motel.entity';

@Injectable()
export class StatisticsService {
    constructor(
        @InjectRepository(Bill)
        private readonly billRepository: Repository<Bill>,
        @InjectRepository(Room)
        private readonly roomRepository: Repository<Room>,
        @InjectRepository(Contract)
        private readonly contractRepository: Repository<Contract>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Motel)
        private readonly motelRepository: Repository<Motel>,
    ) { }

    async getLandlordRevenue(userId: string) {
        const today = new Date();
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

        const bills = await this.billRepository
            .createQueryBuilder('bill')
            .leftJoinAndSelect('bill.contract', 'contract')
            .leftJoinAndSelect('contract.room', 'room')
            .leftJoinAndSelect('contract.motel', 'motel')
            .where('bill.isPaid = :isPaid', { isPaid: true })
            .andWhere('bill.month >= :sixMonthsAgo', { sixMonthsAgo })
            .andWhere(
                '(room.ownerId = :userId OR motel.ownerId = :userId)',
                { userId }
            )
            .getMany();

        const monthlyRevenue = {};

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
            monthlyRevenue[key] = 0;
        }

        bills.forEach(bill => {

            const date = new Date(bill.month);
            const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
            if (monthlyRevenue[key] !== undefined) {
                monthlyRevenue[key] += bill.totalAmount;
            }
        });

        return Object.entries(monthlyRevenue).map(([name, value]) => ({
            name,
            total: value
        }));
    }

    async getLandlordRoomStatus(userId: string) {
        const rooms = await this.roomRepository.find({
            where: { ownerId: userId }
        });

        const statusCounts = {
            [RoomStatus.VACANT]: 0,
            [RoomStatus.OCCUPIED]: 0,
            [RoomStatus.MAINTENANCE]: 0,
        };

        rooms.forEach(room => {
            if (statusCounts[room.status] !== undefined) {
                statusCounts[room.status]++;
            }
        });

        return [
            { name: 'Trống', value: statusCounts[RoomStatus.VACANT], color: '#10B981' }, 
            { name: 'Đã thuê', value: statusCounts[RoomStatus.OCCUPIED], color: '#3B82F6' }, 
            { name: 'Bảo trì', value: statusCounts[RoomStatus.MAINTENANCE], color: '#F59E0B' }, 
        ];
    }

    async getLandlordOverview(userId: string) {

        const totalRooms = await this.roomRepository.count({
            where: { ownerId: userId }
        });

        const activeContracts = await this.contractRepository
            .createQueryBuilder('contract')
            .leftJoin('contract.room', 'room')
            .leftJoin('contract.motel', 'motel')
            .where('contract.status = :status', { status: 'ACTIVE' })
            .andWhere(
                '(room.ownerId = :userId OR motel.ownerId = :userId)',
                { userId }
            )
            .getCount();

        const totalTenants = activeContracts;

        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const monthlyRevenue = await this.billRepository
            .createQueryBuilder('bill')
            .leftJoin('bill.contract', 'contract')
            .leftJoin('contract.room', 'room')
            .leftJoin('contract.motel', 'motel')
            .where('bill.isPaid = :isPaid', { isPaid: true })
            .andWhere('bill.month >= :startOfMonth', { startOfMonth })
            .andWhere('bill.month <= :endOfMonth', { endOfMonth })
            .andWhere(
                '(room.ownerId = :userId OR motel.ownerId = :userId)',
                { userId }
            )
            .select('SUM(bill.totalAmount)', 'total')
            .getRawOne();

        return {
            totalRooms,
            totalTenants,
            monthlyRevenue: monthlyRevenue.total || 0
        };
    }

    // ============ ADMIN STATISTICS ============

    async getAdminOverview() {
        const totalUsers = await this.userRepository.count();
        const totalMotels = await this.motelRepository.count();
        const totalRooms = await this.roomRepository.count();
        const totalContracts = await this.contractRepository.count();
        const activeContracts = await this.contractRepository.count({
            where: { status: ContractStatus.ACTIVE }
        });

        const totalRevenue = await this.billRepository
            .createQueryBuilder('bill')
            .where('bill.isPaid = :isPaid', { isPaid: true })
            .select('SUM(bill.totalAmount)', 'total')
            .getRawOne();

        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const monthlyRevenue = await this.billRepository
            .createQueryBuilder('bill')
            .where('bill.isPaid = :isPaid', { isPaid: true })
            .andWhere('bill.month >= :startOfMonth', { startOfMonth })
            .andWhere('bill.month <= :endOfMonth', { endOfMonth })
            .select('SUM(bill.totalAmount)', 'total')
            .getRawOne();

        return {
            totalUsers,
            totalMotels,
            totalRooms,
            totalContracts,
            activeContracts,
            totalRevenue: totalRevenue.total || 0,
            monthlyRevenue: monthlyRevenue.total || 0,
        };
    }

    async getAdminRevenueChart() {
        const today = new Date();
        const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);

        const bills = await this.billRepository
            .createQueryBuilder('bill')
            .where('bill.isPaid = :isPaid', { isPaid: true })
            .andWhere('bill.month >= :twelveMonthsAgo', { twelveMonthsAgo })
            .getMany();

        const monthlyData = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = d.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
            monthlyData.push({
                month: monthName,
                revenue: 0,
            });
        }

        bills.forEach(bill => {
            const date = new Date(bill.month);
            const monthIndex = (date.getFullYear() - today.getFullYear()) * 12 + (date.getMonth() - today.getMonth()) + 11;
            if (monthIndex >= 0 && monthIndex < 12) {
                monthlyData[monthIndex].revenue += bill.totalAmount;
            }
        });

        return monthlyData;
    }

    async getAdminUserGrowth() {
        const today = new Date();
        const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);

        const users = await this.userRepository
            .createQueryBuilder('user')
            .where('user.createdAt >= :twelveMonthsAgo', { twelveMonthsAgo })
            .getMany();

        const monthlyData = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = d.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
            monthlyData.push({
                month: monthName,
                users: 0,
            });
        }

        users.forEach(user => {
            const date = new Date(user.createdAt);
            const monthIndex = (date.getFullYear() - today.getFullYear()) * 12 + (date.getMonth() - today.getMonth()) + 11;
            if (monthIndex >= 0 && monthIndex < 12) {
                monthlyData[monthIndex].users += 1;
            }
        });

        return monthlyData;
    }

    async getAdminContractStatus() {
        const statusCounts = {
            [ContractStatus.ACTIVE]: 0,
            [ContractStatus.PENDING_TENANT]: 0,
            [ContractStatus.TERMINATED]: 0,
            [ContractStatus.EXPIRED]: 0,
        };

        const contracts = await this.contractRepository.find();
        contracts.forEach(contract => {
            if (statusCounts[contract.status] !== undefined) {
                statusCounts[contract.status]++;
            }
        });

        return [
            { name: 'Đang hoạt động', value: statusCounts[ContractStatus.ACTIVE], color: '#10B981' },
            { name: 'Chờ duyệt', value: statusCounts[ContractStatus.PENDING_TENANT], color: '#F59E0B' },
            { name: 'Đã kết thúc', value: statusCounts[ContractStatus.TERMINATED], color: '#EF4444' },
            { name: 'Hết hạn', value: statusCounts[ContractStatus.EXPIRED], color: '#6B7280' },
        ];
    }

    async getAdminOccupancyRate() {
        const rooms = await this.roomRepository.find();
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
        const vacantRooms = rooms.filter(r => r.status === RoomStatus.VACANT).length;
        const maintenanceRooms = rooms.filter(r => r.status === RoomStatus.MAINTENANCE).length;

        return [
            { name: 'Đã thuê', value: occupiedRooms, color: '#3B82F6' },
            { name: 'Trống', value: vacantRooms, color: '#10B981' },
            { name: 'Bảo trì', value: maintenanceRooms, color: '#F59E0B' },
        ];
    }
}
