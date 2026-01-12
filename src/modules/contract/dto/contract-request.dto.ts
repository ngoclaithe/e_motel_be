import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsEnum,
    IsDateString,
    Min,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContractType } from '../entities/contract.entity';
import { ContractRequestInitiator } from '../entities/contract-request.entity';

export class CreateContractRequestDto {
    @IsEnum(ContractType)
    @IsNotEmpty()
    type: ContractType;

    @IsString()
    @IsOptional()
    roomId?: string;

    @IsString()
    @IsOptional()
    motelId?: string;

    @IsString()
    @IsNotEmpty()
    tenantId: string;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Type(() => Number)
    monthlyRent: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Type(() => Number)
    deposit: number;

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

    @IsString()
    @IsOptional()
    @MaxLength(2000)
    specialTerms?: string;

    @IsString()
    @IsOptional()
    @MaxLength(1000)
    message?: string;
}

export class RespondToContractRequestDto {
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    responseMessage?: string;
}

export class UpdateContractRequestDto {
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    monthlyRent?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    deposit?: number;

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

    @IsString()
    @IsOptional()
    @MaxLength(2000)
    specialTerms?: string;

    @IsString()
    @IsOptional()
    @MaxLength(1000)
    message?: string;
}
