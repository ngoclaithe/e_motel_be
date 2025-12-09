import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaceVerificationService } from './face-verification.service';
import { FaceVerificationController } from './face-verification.controller';
import { User } from '../user/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        AuthModule,
    ],
    controllers: [FaceVerificationController],
    providers: [FaceVerificationService],
    exports: [FaceVerificationService],
})
export class FaceVerificationModule { }
