// Fix crypto for Node.js 18
import * as crypto from 'crypto';
if (typeof global.crypto === 'undefined') {
  global.crypto = crypto as any;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'http://localhost:8081',
    'https://jctop-client.zeabur.app',
    'https://*.zeabur.app'
  ];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list or matches pattern
      if (corsOrigins.includes(origin) || 
          corsOrigins.some(allowed => {
            if (allowed.includes('*')) {
              const pattern = allowed.replace('*', '.*');
              return new RegExp(pattern).test(origin);
            }
            return allowed === origin;
          })) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
  
  const config = new DocumentBuilder()
    .setTitle('JCTOP Event Management API')
    .setDescription('The JCTOP Event Management API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();