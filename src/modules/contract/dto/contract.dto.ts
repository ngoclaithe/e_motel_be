import { 
  IsUUID, 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsDateString, 
  IsInt,
  IsEnum,
  ValidateIf,
  Min,
  Max,
  MaxLength 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContractType } from '../entities/contract.entity';

export class CreateContractDto {
  @IsEnum(ContractType)
  @IsNotEmpty({ message: 'type is required (ROOM or MOTEL)' })
  type: ContractType;

  // Room ID - required nếu type = ROOM
  @ValidateIf(o => o.type === ContractType.ROOM)
  @IsUUID()
  @IsNotEmpty({ message: 'roomId is required when type is ROOM' })
  roomId?: string;

  // Motel ID - required nếu type = MOTEL
  @ValidateIf(o => o.type === ContractType.MOTEL)
  @IsUUID()
  @IsNotEmpty({ message: 'motelId is required when type is MOTEL' })
  motelId?: string;

  @IsUUID()
  @IsNotEmpty({ message: 'tenantId is required' })
  tenantId: string;

  @IsDateString({}, { message: 'startDate must be a valid ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)' })
  @IsNotEmpty({ message: 'startDate is required' })
  startDate: string;

  @IsDateString({}, { message: 'endDate must be a valid ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)' })
  @IsNotEmpty({ message: 'endDate is required' })
  endDate: string;

  @IsNumber({}, { message: 'monthlyRent must be a number' })
  @Min(0, { message: 'monthlyRent must be at least 0' })
  @Type(() => Number)
  monthlyRent: number;

  @IsNumber({}, { message: 'deposit must be a number' })
  @Min(0, { message: 'deposit must be at least 0' })
  @Type(() => Number)
  deposit: number;

  @IsInt({ message: 'paymentCycleMonths must be an integer' })
  @Min(1, { message: 'paymentCycleMonths must be at least 1' })
  @Type(() => Number)
  @IsOptional()
  paymentCycleMonths?: number; // Default sẽ lấy từ room/motel

  @IsInt({ message: 'paymentDay must be an integer between 1-31' })
  @Min(1, { message: 'paymentDay must be at least 1' })
  @Max(31, { message: 'paymentDay must be at most 31' })
  @Type(() => Number)
  @IsOptional()
  paymentDay?: number; // Ngày thanh toán hàng tháng

  @IsInt({ message: 'depositMonths must be an integer' })
  @Min(0, { message: 'depositMonths must be at least 0' })
  @Type(() => Number)
  @IsOptional()
  depositMonths?: number; // Default sẽ lấy từ room/motel

  @IsInt({ message: 'maxOccupants must be an integer' })
  @Min(1, { message: 'maxOccupants must be at least 1' })
  @Type(() => Number)
  @IsOptional()
  maxOccupants?: number; // Default sẽ lấy từ room/motel

  // Override giá dịch vụ nếu khác với room/motel
  @IsNumber({}, { message: 'electricityCostPerKwh must be a number' })
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  electricityCostPerKwh?: number;

  @IsNumber({}, { message: 'waterCostPerCubicMeter must be a number' })
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  waterCostPerCubicMeter?: number;

  @IsNumber({}, { message: 'internetCost must be a number' })
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  internetCost?: number;

  @IsNumber({}, { message: 'parkingCost must be a number' })
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  parkingCost?: number;

  @IsNumber({}, { message: 'serviceFee must be a number' })
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  serviceFee?: number;

  @IsString()
  @IsOptional()
  @MaxLength(5000, { message: 'specialTerms must not exceed 5000 characters' })
  specialTerms?: string; // Điều khoản đặc biệt
}

export class UpdateContractDto {
  @IsDateString({}, { message: 'startDate must be a valid ISO date string' })
  @IsOptional()
  startDate?: string;

  @IsDateString({}, { message: 'endDate must be a valid ISO date string' })
  @IsOptional()
  endDate?: string;

  @IsNumber({}, { message: 'monthlyRent must be a number' })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  monthlyRent?: number;

  @IsNumber({}, { message: 'deposit must be a number' })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  deposit?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  paymentCycleMonths?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(31)
  @Type(() => Number)
  paymentDay?: number;

  @IsNumber({}, { message: 'electricityCostPerKwh must be a number' })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  electricityCostPerKwh?: number;

  @IsNumber({}, { message: 'waterCostPerCubicMeter must be a number' })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  waterCostPerCubicMeter?: number;

  @IsNumber({}, { message: 'internetCost must be a number' })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  internetCost?: number;

  @IsNumber({}, { message: 'parkingCost must be a number' })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  parkingCost?: number;

  @IsNumber({}, { message: 'serviceFee must be a number' })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  serviceFee?: number;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  specialTerms?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  documentUrl?: string;
}