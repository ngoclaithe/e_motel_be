import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { ContractRequest } from './entities/contract-request.entity';
import { Room } from '../room/entities/room.entity';
import { Motel } from '../motel/entities/motel.entity';
import { User } from '../user/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { ContractRequestService } from './contract-request.service';
import { ContractRequestController } from './contract-request.controller';

import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, ContractRequest, Room, User, Motel]),
    AuthModule,
    NotificationModule,
  ],
  controllers: [ContractController, ContractRequestController],
  providers: [ContractService, ContractRequestService],
  exports: [ContractService, ContractRequestService],
})
export class ContractModule { }