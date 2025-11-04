import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsArray, 
  IsUrl,
  Min,
  MaxLength,
  ArrayMaxSize 
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMotelDto {
  @IsString()
  @IsNotEmpty({ message: 'Motel name is required' })
  @MaxLength(200, { message: 'Motel name must not exceed 200 characters' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @MaxLength(500, { message: 'Address must not exceed 500 characters' })
  address: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Total rooms is required' })
  @Min(1, { message: 'Total rooms must be at least 1' })
  @Type(() => Number)
  totalRooms: number;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'Logo must be a valid URL' })
  logo?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true, message: 'Each image must be a valid URL' })
  @ArrayMaxSize(20, { message: 'Maximum 20 images allowed' })
  images?: string[];
}

export class UpdateMotelDto {
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Motel name must not exceed 200 characters' })
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Address must not exceed 500 characters' })
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'Total rooms must be at least 1' })
  @Type(() => Number)
  totalRooms?: number;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'Logo must be a valid URL' })
  logo?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true, message: 'Each image must be a valid URL' })
  @ArrayMaxSize(20, { message: 'Maximum 20 images allowed' })
  images?: string[];
}