import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RatesService } from './rates.service';
import { ExchangeProviderService } from '../exchange-provider/exchange-provider.service';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import { Currency } from '../entities/currency.entity';

describe('RatesService', () => {
  let service: RatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatesService,
        {
          provide: getRepositoryToken(ExchangeRate),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Currency),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: ExchangeProviderService,
          useValue: {
            fetchRates: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RatesService>(RatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
