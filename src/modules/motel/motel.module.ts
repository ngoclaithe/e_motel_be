import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Motel } from './entities/motel.entity';
import { Image } from '../image/entities/image.entity';
import { AuthModule } from '../auth/auth.module';
import { MotelService } from './motel.service';
import { MotelController } from './motel.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Motel, Image]),
    CloudinaryModule,
    AuthModule,
  ],
  controllers: [MotelController],
  providers: [MotelService],
  exports: [MotelService],
})
export class MotelModule {}