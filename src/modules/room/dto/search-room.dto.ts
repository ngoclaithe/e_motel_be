import {
    IsString,
    IsOptional,
    IsNumber,
    IsBoolean,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SearchRoomDto {
    @IsString()
    @IsOptional()
    type?: 'ROOM' | 'MOTEL';

    @IsString()
    @IsOptional()
    keyword?: string;

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
    @Min(1)
    @Type(() => Number)
    page?: number;

    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    hasAirConditioner?: boolean;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    hasWifi?: boolean;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    hasKitchen?: boolean;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    hasParking?: boolean;

    @IsString()
    @IsOptional()
    sort?: string;
}
