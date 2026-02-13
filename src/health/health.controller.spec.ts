import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { DataSource } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('HealthController', () => {
  let controller: HealthController;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: DataSource,
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health status if database is connected', async () => {
    jest.spyOn(dataSource, 'query').mockResolvedValue([]);
    const result = await controller.checkHealth();
    expect(result).toEqual({ status: 'ok', database: 'connected' });
  });

  it('should throw HttpException if database is disconnected', async () => {
    jest.spyOn(dataSource, 'query').mockRejectedValue(new Error('DB Error'));
    try {
      await controller.checkHealth();
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(error.getResponse()).toEqual({ status: 'error', database: 'disconnected' });
    }
  });
});
