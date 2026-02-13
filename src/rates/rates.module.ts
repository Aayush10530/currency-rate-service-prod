import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatesService } from './rates.service';
import { RatesController } from './rates.controller';
import { ExchangeProviderModule } from '../exchange-provider/exchange-provider.module';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import { Currency } from '../entities/currency.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExchangeRate, Currency]),
    ExchangeProviderModule,
  ],
  controllers: [RatesController],
  providers: [RatesService],
})
export class RatesModule { }
