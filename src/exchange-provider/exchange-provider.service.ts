import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timer, throwError } from 'rxjs';
import { catchError, timeout, retry, map } from 'rxjs/operators';
import { AxiosError } from 'axios';

export interface ExchangeRateResponse {
    amount: number;
    base: string;
    date: string;
    rates: Record<string, number>;
}

@Injectable()
export class ExchangeProviderService {
    private readonly logger = new Logger(ExchangeProviderService.name);
    private readonly apiUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {
        this.apiUrl = this.configService.get<string>('EXCHANGE_API_URL', 'https://api.frankfurter.app/latest');
    }

    async fetchRates(base: string = 'USD'): Promise<ExchangeRateResponse> {
        const obs$ = this.httpService.get<ExchangeRateResponse>(this.apiUrl, {
            params: { from: base },
        }).pipe(
            timeout(5000), // 5s timeout
            retry({
                count: 3,
                delay: (error, retryCount) => {
                    const delayMs = 1000 * Math.pow(2, retryCount - 1); // Exponential backoff: 1s, 2s, 4s
                    const message = error?.message ?? 'Unknown error';
                    this.logger.warn(`Attempt ${retryCount} failed: ${message}. Retrying in ${delayMs}ms...`);
                    return timer(delayMs);
                }
            }),
            map(response => response.data),
            catchError((error: AxiosError | any) => {
                const message = error?.message ?? 'Unknown error';
                this.logger.error(`Failed to fetch rates after retries: ${message}`, error.stack);
                return throwError(() => error);
            })
        );

        try {
            return await firstValueFrom(obs$);
        } catch (error) {
            throw error;
        }
    }
}
