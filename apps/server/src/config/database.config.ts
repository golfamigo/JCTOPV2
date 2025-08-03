import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  return {
    type: 'postgres',
    url: databaseUrl,
    entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    migrationsRun: process.env.NODE_ENV === 'production',
    logging: process.env.NODE_ENV === 'development',
    ssl: false, // Zeabur doesn't support SSL
  };
});