import { IsOptional, IsString, Length } from 'class-validator';

export class GetLatestRatesDto {
    @IsOptional()
    @IsString()
    @Length(3, 3)
    base?: string;
}
