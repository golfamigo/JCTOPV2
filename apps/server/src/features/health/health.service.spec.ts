import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const mockDataSource = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    dataSource = module.get<DataSource>(DataSource) as jest.Mocked<DataSource>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return healthy status when database connection is successful', async () => {
      dataSource.query.mockResolvedValue([{ db_name: 'test_db', db_version: 'PostgreSQL 16.0' }]);

      const result = await service.checkHealth();

      expect(result.status).toBe('ok');
      expect(result.database.status).toBe('connected');
      expect(result.database.message).toBeUndefined();
      expect(result.timestamp).toBeDefined();
      expect(dataSource.query).toHaveBeenCalledWith('SELECT current_database() as db_name, version() as db_version');
    });

    it('should return error status when database connection fails', async () => {
      const errorMessage = 'Connection failed';
      dataSource.query.mockRejectedValue(new Error(errorMessage));

      const result = await service.checkHealth();

      expect(result.status).toBe('error');
      expect(result.database.status).toBe('disconnected');
      expect(result.database.message).toBe(errorMessage);
      expect(result.timestamp).toBeDefined();
      expect(dataSource.query).toHaveBeenCalledWith('SELECT current_database() as db_name, version() as db_version');
    });

    it('should include valid timestamp in ISO format', async () => {
      dataSource.query.mockResolvedValue([{ db_name: 'test_db', db_version: 'PostgreSQL 16.0' }]);

      const result = await service.checkHealth();

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });
});