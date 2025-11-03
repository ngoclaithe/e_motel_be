export class CreateRoomDto {
  number: string;
  area: number;
  price: number;
  amenities: string[];
  motelId: string;
  images?: string[];
}

export class UpdateRoomDto {
  number?: string;
  area?: number;
  price?: number;
  amenities?: string[];
  status?: string;
  tenantId?: string;
  images?: string[];
}