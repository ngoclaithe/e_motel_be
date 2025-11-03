export class CreateContractDto {
  roomId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  deposit: number;
  paymentCycle: number;
  documentUrl?: string;
}

export class UpdateContractDto {
  startDate?: Date;
  endDate?: Date;
  deposit?: number;
  paymentCycle?: number;
  documentUrl?: string;
}