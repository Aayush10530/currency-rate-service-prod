import { IsString, Length, Matches } from 'class-validator';

export class GetAverageRateDto {
    @IsString()
    @Length(3, 3)
    base: string;

    @IsString()
    @Length(3, 3)
    target: string;

    @IsString()
    @Matches(/^\d+h$/, { message: 'Period must be in the format "Nh" (e.g., "24h")' })
    period: string;
}
