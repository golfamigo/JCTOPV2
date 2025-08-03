import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthStatus } from '@jctop-event/shared-types';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  async checkHealth(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    
    try {
      // Check database connectivity with a meaningful query
      const result = await this.dataSource.query('SELECT current_database() as db_name, version() as db_version');
      if (!result || result.length === 0) {
        throw new Error('Database query returned no results');
      }
      
      return {
        status: 'ok',
        database: {
          status: 'connected',
        },
        timestamp,
      };
    } catch (error) {
      return {
        status: 'error',
        database: {
          status: 'disconnected',
          message: error.message,
        },
        timestamp,
      };
    }
  }
}