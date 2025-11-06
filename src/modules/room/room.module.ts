import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { AuthModule } from '../auth/auth.module';
import { Image } from '../image/entities/image.entity';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { Motel} from '../motel/entities/motel.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Room, Image, Motel]),
    AuthModule,
  ],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}