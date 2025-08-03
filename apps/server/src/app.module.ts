import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import encryptionConfig from './config/encryption.config';
import { HealthModule } from './features/health/health.module';
import { AuthModule } from './features/auth/auth.module';
import { EventsModule } from './features/events/events.module';
import { PaymentsModule } from './features/payments/payments.module';
import { RegistrationsModule } from './features/registrations/registrations.module';
import { OrganizerModule } from './features/organizer/organizer.module';
import { InvoicingModule } from './features/invoicing/invoicing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, encryptionConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => databaseConfig(),
    }),
    HealthModule,
    AuthModule,
    EventsModule,
    PaymentsModule,
    RegistrationsModule,
    OrganizerModule,
    InvoicingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}