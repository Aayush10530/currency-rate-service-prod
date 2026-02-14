import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { RatesService } from './rates.service';
import { FetchRatesDto } from './dto/fetch-rates.dto';
import { GetLatestRatesDto } from './dto/get-latest.dto';
import { GetAverageRateDto } from './dto/get-average.dto';

@Controller('rates')
export class RatesController {
    constructor(private readonly ratesService: RatesService) { }

    @Post('fetch')
    @HttpCode(HttpStatus.OK)
    async fetchRates(@Body() dto: FetchRatesDto) {
        await this.ratesService.fetchAndSaveRates(dto);
        return { message: 'Rates fetched successfully', base: dto.base ?? 'USD' };
    }

    @Get('latest')
    async getLatestRates(@Query() dto: GetLatestRatesDto) {
        const rates = await this.ratesService.getLatestRates(dto);
        if (!rates.length) {
            return {
                base: dto.base || 'USD',
                date: null,
                rates: {}
            };
        }

        const base = rates[0].baseCurrency.code;
        const date = rates[0].fetchedAt.toISOString().split('T')[0]; // YYYY-MM-DD
        const ratesMap: Record<string, number> = {};

        rates.forEach(r => {
            ratesMap[r.targetCurrency.code] = parseFloat(r.rate);
        });

        return {
            base,
            date,
            rates: ratesMap
        };
    }

    @Get('average')
    async getAverageRate(@Query() dto: GetAverageRateDto) {
        const result = await this.ratesService.getAverageRate(dto);
        return {
            base: dto.base || 'USD',
            target: dto.target,
            period: dto.period,
            average_rate: result.averageRate,
            data_points: result.count
        };
    }
}
