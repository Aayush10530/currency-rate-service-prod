import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ExchangeProviderService } from './exchange-provider.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [ExchangeProviderService],
  exports: [ExchangeProviderService],
})
export class ExchangeProviderModule { }
