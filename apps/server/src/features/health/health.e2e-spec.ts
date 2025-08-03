import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { HealthModule } from './health.module';

describe('Health (e2e)', () => {
  let app: INestApplication;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const mockDataSource = {
      query: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    })
      .overrideProvider(DataSource)
      .useValue(mockDataSource)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource) as jest.Mocked<DataSource>;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/v1/health', () => {
    it('should return 200 OK when database is connected', async () => {
      dataSource.query.mockResolvedValue([{ db_name: 'test_db', db_version: 'PostgreSQL 16.0' }]);

      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        database: {
          status: 'connected',
        },
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });

    it('should return 503 Service Unavailable when database connection fails', async () => {
      dataSource.query.mockRejectedValue(new Error('Connection timeout'));

      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(503);

      expect(response.body).toEqual({
        status: 'error',
        database: {
          status: 'disconnected',
          message: 'Connection timeout',
        },
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      });
    });
  });
});