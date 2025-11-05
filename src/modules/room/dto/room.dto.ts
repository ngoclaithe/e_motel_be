import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsArray, 
  IsUrl,
  IsEnum,
  IsBoolean,
  IsDateString,
  Min,
  Max,
  MaxLength,
  ArrayMaxSize 
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoomStatus, BathroomType, FurnishingStatus } from '../entities/room.entity';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty({ message: 'Room number is required' })
  @MaxLength(50, { message: 'Room number must not exceed 50 characters' })
  number: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Area is required' })
  @Min(1, { message: 'Area must be at least 1' })
  @Type(() => Number)
  area: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Price is required' })
  @Min(0, { message: 'Price must be at least 0' })
  @Type(() => Number)
  price: number;

  @IsString()
  @IsOptional()
  motelId?: string;

  // Bathroom
  @IsEnum(BathroomType)
  @IsOptional()
  bathroomType?: BathroomType;

  @IsBoolean()
  @IsOptional()
  hasWaterHeater?: boolean;

  // Room Features
  @IsEnum(FurnishingStatus)
  @IsOptional()
  furnishingStatus?: FurnishingStatus;

  @IsBoolean()
  @IsOptional()
  hasAirConditioner?: boolean;

  @IsBoolean()
  @IsOptional()
  hasBalcony?: boolean;

  @IsBoolean()
  @IsOptional()
  hasWindow?: boolean;

  @IsBoolean()
  @IsOptional()
  hasKitchen?: boolean;

  @IsBoolean()
  @IsOptional()
  hasRefrigerator?: boolean;

  @IsBoolean()
  @IsOptional()
  hasWashingMachine?: boolean;

  @IsBoolean()
  @IsOptional()
  hasWardrobe?: boolean;

  @IsBoolean()
  @IsOptional()
  hasBed?: boolean;

  @IsBoolean()
  @IsOptional()
  hasDesk?: boolean;

  @IsBoolean()
  @IsOptional()
  hasWifi?: boolean;

  // Capacity & Restrictions
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  maxOccupancy?: number;

  @IsBoolean()
  @IsOptional()
  allowPets?: boolean;

  @IsBoolean()
  @IsOptional()
  allowCooking?: boolean;

  @IsBoolean()
  @IsOptional()
  allowOppositeGender?: boolean;

  // Floor & Position
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  floor?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  direction?: string;

  // Utilities Cost
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  electricityCostPerKwh?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  waterCostPerCubicMeter?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  internetCost?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  parkingCost?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  serviceFee?: number;

  // Payment Terms
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  paymentCycleMonths?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(12)
  @Type(() => Number)
  depositMonths?: number;

  // Additional Info
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @IsDateString()
  @IsOptional()
  availableFrom?: Date;

  // Images
  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true, message: 'Each image must be a valid URL' })
  @ArrayMaxSize(20, { message: 'Maximum 20 images allowed' })
  images?: string[];
}

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Room number must not exceed 50 characters' })
  number?: string;

  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'Area must be at least 1' })
  @Type(() => Number)
  area?: number;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Price must be at least 0' })
  @Type(() => Number)
  price?: number;

  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;

  @IsString()
  @IsOptional()
  tenantId?: string;

  // Bathroom
  @IsEnum(BathroomType)
  @IsOptional()
  bathroomType?: BathroomType;

  @IsBoolean()
  @IsOptional()
  hasWaterHeater?: boolean;

  // Room Features
  @IsEnum(FurnishingStatus)
  @IsOptional()
  furnishingStatus?: FurnishingStatus;

  @IsBoolean()
  @IsOptional()
  hasAirConditioner?: boolean;

  @IsBoolean()
  @IsOptional()
  hasBalcony?: boolean;

  @IsBoolean()
  @IsOptional()
  hasWindow?: boolean;

  @IsBoolean()
  @IsOptional()
  hasKitchen?: boolean;

  @IsBoolean()
  @IsOptional()
  hasRefrigerator?: boolean;

  @IsBoolean()
  @IsOptional()
  hasWashingMachine?: boolean;

  @IsBoolean()
  @IsOptional()
  hasWardrobe?: boolean;

  @IsBoolean()
  @IsOptional()
  hasBed?: boolean;

  @IsBoolean()
  @IsOptional()
  hasDesk?: boolean;

  @IsBoolean()
  @IsOptional()
  hasWifi?: boolean;

  // Capacity & Restrictions
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  maxOccupancy?: number;

  @IsBoolean()
  @IsOptional()
  allowPets?: boolean;

  @IsBoolean()
  @IsOptional()
  allowCooking?: boolean;

  @IsBoolean()
  @IsOptional()
  allowOppositeGender?: boolean;

  // Floor & Position
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  floor?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  direction?: string;

  // Utilities Cost
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  electricityCostPerKwh?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  waterCostPerCubicMeter?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  internetCost?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  parkingCost?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  serviceFee?: number;

  // Payment Terms
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  paymentCycleMonths?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(12)
  @Type(() => Number)
  depositMonths?: number;

  // Additional Info
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @IsDateString()
  @IsOptional()
  availableFrom?: Date;

  // Images
  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true, message: 'Each image must be a valid URL' })
  @ArrayMaxSize(20, { message: 'Maximum 20 images allowed' })
  images?: string[];
}