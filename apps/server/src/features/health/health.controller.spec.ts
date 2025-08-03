import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HealthStatus } from '@jctop-event/shared-types';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: jest.Mocked<HealthService>;
  let mockResponse: jest.Mocked<Response>;

  beforeEach(async () => {
    const mockHealthService = {
      checkHealth: jest.fn(),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get<HealthService>(HealthService) as jest.Mocked<HealthService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return 200 OK when health check passes', async () => {
      const healthyStatus: HealthStatus = {
        status: 'ok',
        database: { status: 'connected' },
        timestamp: '2025-07-30T12:00:00.000Z',
      };

      healthService.checkHealth.mockResolvedValue(healthyStatus);

      await controller.checkHealth(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(healthyStatus);
      expect(healthService.checkHealth).toHaveBeenCalled();
    });

    it('should return 503 Service Unavailable when health check fails', async () => {
      const unhealthyStatus: HealthStatus = {
        status: 'error',
        database: { 
          status: 'disconnected',
          message: 'Database connection failed'
        },
        timestamp: '2025-07-30T12:00:00.000Z',
      };

      healthService.checkHealth.mockResolvedValue(unhealthyStatus);

      await controller.checkHealth(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith(unhealthyStatus);
      expect(healthService.checkHealth).toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      healthService.checkHealth.mockRejectedValue(new Error('Service error'));

      await expect(controller.checkHealth(mockResponse)).rejects.toThrow('Service error');
      expect(healthService.checkHealth).toHaveBeenCalled();
    });
  });
});