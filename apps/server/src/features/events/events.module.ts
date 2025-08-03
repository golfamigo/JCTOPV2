import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../../entities/event.entity';
import { Category } from '../../entities/category.entity';
import { Venue } from '../../entities/venue.entity';
import { TicketType } from '../../entities/ticket-type.entity';
import { SeatingZone } from '../../entities/seating-zone.entity';
import { DiscountCode } from '../../entities/discount-code.entity';
import { CustomRegistrationField } from '../../entities/custom-registration-field.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { User } from '../../entities/user.entity';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { AttendeeManagementService } from './services/attendee-management.service';
import { AttendeeSearchService } from './services/attendee-search.service';
import { AttendeeExportService } from '../registrations/services/attendee-export.service';
import { CheckInService } from './services/checkin.service';
import { QrCodeService } from '../registrations/services/qr-code.service';
import { EventStatisticsService } from './services/event-statistics.service';
import { EventReportService } from './services/event-report.service';
import { ReportExportService } from './services/report-export.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Category, Venue, TicketType, SeatingZone, DiscountCode, CustomRegistrationField, Registration, User])],
  controllers: [EventsController],
  providers: [EventsService, AttendeeManagementService, AttendeeSearchService, AttendeeExportService, CheckInService, QrCodeService, EventStatisticsService, EventReportService, ReportExportService],
  exports: [EventsService],
})
export class EventsModule {}