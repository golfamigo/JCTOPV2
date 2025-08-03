import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { PaymentProvider } from './entities/payment-provider.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { PaymentsController } from './payments.controller';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { PaymentProviderService } from './services/payment-provider.service';
import { CredentialsEncryptionService } from './services/credentials-encryption.service';
import { ECPayProvider } from './providers/ecpay/ecpay.provider';
import { ProviderFactory } from './providers/provider.factory';
import { RegistrationsModule } from '../registrations/registrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PaymentProvider,
      PaymentTransaction,
    ]),
    ConfigModule,
    forwardRef(() => RegistrationsModule),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentGatewayService,
    PaymentProviderService,
    CredentialsEncryptionService,
    ECPayProvider,
    ProviderFactory,
  ],
  exports: [
    PaymentGatewayService,
    PaymentProviderService,
    CredentialsEncryptionService,
  ],
})
export class PaymentsModule {}