import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity';
import { Contract } from '../contract/entities/contract.entity';
import { AuthModule } from '../auth/auth.module';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bill, Contract]), MailModule, AuthModule],
  controllers: [BillController],
  providers: [BillService],
  exports: [BillService],
})
export class BillModule {}