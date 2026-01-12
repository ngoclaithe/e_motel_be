import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Bill } from '../bill/entities/bill.entity';
import { Room } from '../room/entities/room.entity';
import { Contract } from '../contract/entities/contract.entity';
import { Motel } from '../motel/entities/motel.entity';
import { User } from '../user/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Bill, Room, Contract, Motel, User]),
        AuthModule
    ],
    controllers: [StatisticsController],
    providers: [StatisticsService],
})
export class StatisticsModule { }
