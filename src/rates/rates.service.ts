import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { ExchangeProviderService } from '../exchange-provider/exchange-provider.service';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import { Currency } from '../entities/currency.entity';
import { FetchRatesDto } from './dto/fetch-rates.dto';
import { GetLatestRatesDto } from './dto/get-latest.dto';
import { GetAverageRateDto } from './dto/get-average.dto';

@Injectable()
export class RatesService {
    private readonly logger = new Logger(RatesService.name);

    constructor(
        @InjectRepository(ExchangeRate)
        private readonly exchangeRateRepository: Repository<ExchangeRate>,
        @InjectRepository(Currency)
        private readonly currencyRepository: Repository<Currency>,
        private readonly exchangeProviderService: ExchangeProviderService,
    ) { }

    async handleCron() {
        try {
            this.logger.log('Running scheduled rate fetch...');
            await this.fetchAndSaveRates();
        } catch (error) {
            this.logger.error('Cron failed', error.stack);
        }
    }

    async fetchAndSaveRates(dto?: FetchRatesDto): Promise<void> {
        const base = dto?.base || 'USD';
        try {
            const data = await this.exchangeProviderService.fetchRates(base);
            if (!data || !data.rates) {
                this.logger.warn('No rates data received from provider');
                return;
            }

            const rates = data.rates;
            const fetchedAt = new Date();

            const baseCurrencyEntity = await this.ensureCurrencyExists(base);

            const exchangeRates: ExchangeRate[] = [];

            for (const [target, rate] of Object.entries(rates)) {
                const targetCurrencyEntity = await this.ensureCurrencyExists(target);

                const exchangeRate = this.exchangeRateRepository.create({
                    baseCurrency: baseCurrencyEntity,
                    targetCurrency: targetCurrencyEntity,
                    rate: String(rate),
                    fetchedAt,
                });
                exchangeRates.push(exchangeRate);
            }

            await this.exchangeRateRepository.save(exchangeRates);
            this.logger.log(`Saved ${exchangeRates.length} exchange rates for base ${base}`);
        } catch (error) {
            this.logger.error(`Error fetching and saving rates: ${error.message}`, error.stack);
        }
    }

    private async ensureCurrencyExists(code: string): Promise<Currency> {
        let currency = await this.currencyRepository.findOne({ where: { code } });
        if (!currency) {
            currency = this.currencyRepository.create({ code });
            await this.currencyRepository.save(currency);
        }
        return currency;
    }

    async getLatestRates(dto: GetLatestRatesDto): Promise<ExchangeRate[]> {
        const base = dto.base || 'USD';

        const latestEntry = await this.exchangeRateRepository.findOne({
            where: {
                baseCurrency: { code: base }
            },
            relations: {
                baseCurrency: true
            },
            order: {
                fetchedAt: 'DESC'
            }
        });

        if (!latestEntry) {
            return [];
        }

        return this.exchangeRateRepository.find({
            where: {
                fetchedAt: latestEntry.fetchedAt,
                baseCurrency: { code: base },
            },
            relations: ['baseCurrency', 'targetCurrency'],
            order: {
                targetCurrency: {
                    code: 'ASC',
                },
            },
        });
    }

    async getAverageRate(dto: GetAverageRateDto): Promise<{ averageRate: number | null; count: number }> {
        const { base, target, period } = dto;
        const hours = parseInt(period.replace('h', ''), 10);
        const since = new Date();
        since.setHours(since.getHours() - hours);

        const result = await this.exchangeRateRepository
            .createQueryBuilder('rate')
            .innerJoin('rate.baseCurrency', 'base')
            .innerJoin('rate.targetCurrency', 'target')
            .select('AVG(rate.rate)', 'average')
            .addSelect('COUNT(rate.id)', 'count')
            .where('base.code = :base', { base })
            .andWhere('target.code = :target', { target })
            .andWhere('rate.fetchedAt >= :since', { since })
            .getRawOne();

        const avg = result?.average ?? null;
        const count = result?.count ?? 0;

        return {
            averageRate: avg ? Number(avg) : null,
            count: Number(count)
        };
    }
}
