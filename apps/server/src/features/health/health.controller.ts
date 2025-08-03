import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { HealthService } from './health.service';
import { HealthStatus } from '@jctop-event/shared-types';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get application health status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ok'] },
        database: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['connected'] }
          }
        },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Application is unhealthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['error'] },
        database: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['disconnected'] },
            message: { type: 'string' }
          }
        },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  async checkHealth(@Res() res: Response): Promise<void> {
    const healthStatus: HealthStatus = await this.healthService.checkHealth();
    
    const statusCode = healthStatus.status === 'ok' 
      ? HttpStatus.OK 
      : HttpStatus.SERVICE_UNAVAILABLE;
    
    res.status(statusCode).json(healthStatus);
  }
}