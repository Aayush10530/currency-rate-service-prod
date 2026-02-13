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
        return this.ratesService.getLatestRates(dto);
    }

    @Get('average')
    async getAverageRate(@Query() dto: GetAverageRateDto) {
        return this.ratesService.getAverageRate(dto);
    }
}
