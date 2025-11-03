export class CreateBillDto {
  contractId: string;
  month: Date;
  electricityStart: number;
  electricityEnd: number;
  waterStart: number;
  waterEnd: number;
  electricityRate: number;
  waterRate: number;
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