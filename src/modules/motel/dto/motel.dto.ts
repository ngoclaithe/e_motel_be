export class CreateMotelDto {
  name: string;
  address: string;
  description?: string;
  totalRooms: number;
  logo?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
}

export class UpdateMotelDto {
  name?: string;
  address?: string;
  description?: string;
  totalRooms?: number;
  logo?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
}