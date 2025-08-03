import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicingController } from './invoicing.controller';
import { InvoicingService } from './invoicing.service';
import { InvoiceSettings } from './entities/invoice-settings.entity';
import { Event } from '../../entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceSettings, Event])],
  controllers: [InvoicingController],
  providers: [InvoicingService],
  exports: [InvoicingService],
})
export class InvoicingModule {}