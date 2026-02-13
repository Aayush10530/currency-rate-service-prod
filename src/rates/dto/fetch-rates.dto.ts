import { IsOptional, IsString } from 'class-validator';

export class FetchRatesDto {
    @IsOptional()
    @IsString()
    base?: string;
}
