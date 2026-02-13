import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ExchangeProviderService, ExchangeRateResponse } from './exchange-provider.service';
import { of, throwError } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

jest.mock('rxjs', () => {
  const original = jest.requireActual('rxjs');
  return {
    ...original,
    timer: jest.fn(() => original.of(0)),
  };
});

describe('ExchangeProviderService', () => {
  let service: ExchangeProviderService;
  let httpService: HttpService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('https://api.test'),
  };

  const mockExchangeRateResponse: ExchangeRateResponse = {
    amount: 1,
    base: 'USD',
    date: '2023-01-01',
    rates: { EUR: 0.9 },
  };

  const mockAxiosResponse: AxiosResponse<ExchangeRateResponse> = {
    data: mockExchangeRateResponse,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeProviderService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ExchangeProviderService>(ExchangeProviderService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch rates successfully', async () => {
    jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

    const result = await service.fetchRates('USD');
    expect(result).toEqual(mockExchangeRateResponse);
    expect(httpService.get).toHaveBeenCalledWith('https://api.test', { params: { from: 'USD' } });
  });

  it('should throw error after retries', async () => {
    const error = new Error('API Error');
    jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

    await expect(service.fetchRates('USD')).rejects.toThrow(error);
    expect(httpService.get).toHaveBeenCalledTimes(1);
    // Note: The retry operator in RxJS resubscribes to the observable.
    // If httpService.get() returns a NEW observable every time, strictly calling .get() once makes sense if we construct the observable once and reuse it?
    // Wait, httpService.get() returns an Observable. Logic:
    // this.httpService.get(...) returns *an* observable.
    // We pipe on that *same* observable instance.
    // Does 'retry' re-execute the function call that created the observable?
    // No, `httpService.get` is called ONCE to return the observable.
    // The *subscription* is retried.
    // So `httpService.get` calls should be 1.
  });
});
