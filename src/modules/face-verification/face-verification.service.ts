import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { VerifyFaceDto } from './dto/verify-face.dto';
import axios from 'axios';

@Injectable()
export class FaceVerificationService {
    private readonly faceApiUrl = process.env.FACE_API_URL || 'http://localhost:8003';

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async verifyFace(userId: string, dto: VerifyFaceDto) {
        console.log('=== FACE VERIFICATION DEBUG ===');
        console.log('User ID:', userId);
        console.log('Selfie URL:', dto.selfieUrl);
        console.log('Face API URL:', this.faceApiUrl);

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        console.log('User avatar:', user.avatar);

        if (!user.avatar) {
            throw new HttpException('User has no avatar. Please upload an avatar first.', HttpStatus.BAD_REQUEST);
        }

        try {
            console.log('Calling FastAPI with:', {
                image1_url: user.avatar,
                image2_url: dto.selfieUrl,
            });

            const response = await axios.post(`${this.faceApiUrl}/api/compare-faces`, {
                image1_url: user.avatar,
                image2_url: dto.selfieUrl,
            });

            console.log('FastAPI response:', response.data);

            const { verified, similarity } = response.data;

            if (verified) {
                user.isVerifiedIdentity = true;
                await this.userRepository.save(user);
                console.log('User verified successfully');
            }

            return {
                verified,
                similarity,
                message: verified
                    ? 'Identity verified successfully'
                    : 'Face verification failed. Please try again.',
            };
        } catch (error) {
            console.error('Face verification error:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                throw new HttpException(
                    error.response.data.detail || 'Face verification failed',
                    error.response.status,
                );
            }
            throw new HttpException(
                'Failed to connect to face verification service',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }
}
