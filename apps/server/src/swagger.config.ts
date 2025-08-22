import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('JCTOP Event Management API')
    .setDescription('API documentation for JCTOP Event Management System')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Events', 'Event management')
    .addTag('Users', 'User management')
    .addTag('Tickets', 'Ticket operations')
    .addTag('Registrations', 'Event registrations')
    .addTag('Organizer', 'Organizer operations')
    .addTag('Admin', 'Admin operations')
    .addTag('System', 'System endpoints')
    .addServer('http://localhost:3001/api/v1', 'Local development')
    .addServer('https://jctop.zeabur.app/api/v1', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'JCTOP API Documentation',
    customfavIcon: 'https://via.placeholder.com/32x32',
    customCss: `
      .swagger-ui .topbar { 
        display: none; 
      }
      .swagger-ui .info .title {
        color: #2563EB;
      }
    `,
  });

  console.log('📚 Swagger documentation available at: http://localhost:3001/api/docs');
}