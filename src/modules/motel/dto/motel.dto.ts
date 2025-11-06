import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsArray, 
  IsUrl,
  IsBoolean,
  IsEnum,
  IsEmail,
  IsPhoneNumber,
  Min,
  Max,
  MaxLength,
  ArrayMaxSize 
} from 'class-validator';
import { Type } from 'class-transformer';
import { AlleyType, SecurityType } from '../entities/motel.entity';

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

  // Location
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  // Access & Infrastructure
  @IsEnum(AlleyType)
  @IsOptional()
  alleyType?: AlleyType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  alleyWidth?: number;

  @IsBoolean()
  @IsOptional()
  hasElevator?: boolean;

  @IsBoolean()
  @IsOptional()
  hasParking?: boolean;

  // Security
  @IsEnum(SecurityType)
  @IsOptional()
  securityType?: SecurityType;

  @IsBoolean()
  @IsOptional()
  has24hSecurity?: boolean;

  // Utilities & Amenities
  @IsBoolean()
  @IsOptional()
  hasWifi?: boolean;

  @IsBoolean()
  @IsOptional()
  hasAirConditioner?: boolean;

  @IsBoolean()
  @IsOptional()
  hasWashingMachine?: boolean;

  @IsBoolean()
  @IsOptional()
  hasKitchen?: boolean;

  @IsBoolean()
  @IsOptional()
  hasRooftop?: boolean;

  @IsBoolean()
  @IsOptional()
  allowPets?: boolean;

  @IsBoolean()
  @IsOptional()
  allowCooking?: boolean;

  // Pricing & Payment
  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Monthly rent must be at least 0' })
  @Type(() => Number)
  monthlyRent?: number;

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

  // Contact Info
  @IsString()
  @IsOptional()
  @MaxLength(20)
  contactPhone?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  contactZalo?: string;

  // Additional Info
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  regulations?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayMaxSize(20)
  nearbyPlaces?: string[];

  // Images
  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true, message: 'Each image must be a valid URL' })
  @ArrayMaxSize(20, { message: 'Maximum 20 images allowed' })
  images?: string[];
}

export class FilterMotelDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minMonthlyRent?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  maxMonthlyRent?: number;

  @IsEnum(AlleyType)
  @IsOptional()
  alleyType?: AlleyType;

  @IsEnum(SecurityType)
  @IsOptional()
  securityType?: SecurityType;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  hasWifi?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  hasParking?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  hasElevator?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  allowPets?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  allowCooking?: boolean;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
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

  // Location
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  // Access & Infrastructure
  @IsEnum(AlleyType)
  @IsOptional()
  alleyType?: AlleyType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  alleyWidth?: number;

  @IsBoolean()
  @IsOptional()
  hasElevator?: boolean;

  @IsBoolean()
  @IsOptional()
  hasParking?: boolean;

  // Security
  @IsEnum(SecurityType)
  @IsOptional()
  securityType?: SecurityType;

  @IsBoolean()
  @IsOptional()
  has24hSecurity?: boolean;

  // Utilities & Amenities
  @IsBoolean()
  @IsOptional()
  hasWifi?: boolean;

  @IsBoolean()
  @IsOptional()
  hasAirConditioner?: boolean;

  @IsBoolean()
  @IsOptional()
  hasWashingMachine?: boolean;

  @IsBoolean()
  @IsOptional()
  hasKitchen?: boolean;

  @IsBoolean()
  @IsOptional()
  hasRooftop?: boolean;

  @IsBoolean()
  @IsOptional()
  allowPets?: boolean;

  @IsBoolean()
  @IsOptional()
  allowCooking?: boolean;

  // Pricing & Payment
  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Monthly rent must be at least 0' })
  @Type(() => Number)
  monthlyRent?: number;

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

  // Contact Info
  @IsString()
  @IsOptional()
  @MaxLength(20)
  contactPhone?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  contactZalo?: string;

  // Additional Info
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  regulations?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayMaxSize(20)
  nearbyPlaces?: string[];

  // Images
  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true, message: 'Each image must be a valid URL' })
  @ArrayMaxSize(20, { message: 'Maximum 20 images allowed' })
  images?: string[];
}