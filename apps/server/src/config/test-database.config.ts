import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Venue } from '../entities/venue.entity';
import { Event } from '../entities/event.entity';
import { TicketType } from '../entities/ticket-type.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the server .env file
dotenv.config({ path: path.join(__dirname, '../../.env'), debug: false });

export const getTestDatabaseConfig = (): TypeOrmModuleOptions => {
  // Use the same PostgreSQL database but with a test schema
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required for tests');
  }

  // Use the same database URL but with a test schema
  return {
    type: 'postgres',
    url: databaseUrl,
    entities: [User, Category, Venue, Event, TicketType],
    schema: 'test_schema', // Use a separate schema for tests
    synchronize: true, // Always sync in tests
    dropSchema: false, // Don't drop schema automatically - will cause issues with concurrent tests
    logging: false,
    ssl: false, // Zeabur doesn't support SSL
  };
};