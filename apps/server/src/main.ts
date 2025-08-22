// Fix crypto for Node.js 18
import * as crypto from 'crypto';
if (typeof global.crypto === 'undefined') {
  global.crypto = crypto as any;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { setupSwagger } from './swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with FlutterFlow support
  const corsOrigins = process.env.NODE_ENV === 'production' 
    ? [
        'http://localhost:3000',
        'http://localhost:3001', 
        'https://jctop.zeabur.app',
        'https://app.flutterflow.io',
        'https://blooming-anchorage-74937-01abcbf2453c.herokuapp.com',
        /\.flutterflow\.io$/,
        /\.herokuapp\.com$/,
      ]
    : true; // Allow all origins in development
    
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
  });
  
  // Validate database connection on startup
  const dataSource = app.get(DataSource);
  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    await dataSource.query('SELECT 1');
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
  
  // Add root health check for deployment platforms
  app.use('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Set global API prefix
  app.setGlobalPrefix('api/v1');
  
  // Setup Swagger documentation
  setupSwagger(app);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();