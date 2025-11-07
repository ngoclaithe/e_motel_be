import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { Room } from '../room/entities/room.entity';
import { Motel } from '../motel/entities/motel.entity';
import { User } from '../user/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Room, User, Motel]), AuthModule],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}