import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registration } from './entities/registration.entity';
import { RegistrationsController } from './registrations.controller';
import { RegistrationCompletionService } from './services/registration-completion.service';
import { QrCodeService } from './services/qr-code.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { Payment } from '../payments/entities/payment.entity';
import { Event } from '../../entities/event.entity';
import { User } from '../../entities/user.entity';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Registration, Payment, Event, User]),
    NotificationsModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationCompletionService, QrCodeService],
  exports: [RegistrationCompletionService],
})
export class RegistrationsModule {}