import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateBillDto {
  @IsString()
  contractId: string;

  @IsDateString()
  month: Date;

  @IsNumber()
  electricityStart: number;

  @IsNumber()
  electricityEnd: number;

  @IsNumber()
  waterStart: number;

  @IsNumber()
  waterEnd: number;

  @IsNumber()
  electricityRate: number;

  @IsNumber()
  waterRate: number;

  @IsNumber()
  @IsOptional()
  otherFees?: number;
}

export class UpdateBillDto {
  electricityStart?: number;
  electricityEnd?: number;
  waterStart?: number;
  waterEnd?: number;
  electricityRate?: number;
  waterRate?: number;
  otherFees?: number;
  isPaid?: boolean;
}