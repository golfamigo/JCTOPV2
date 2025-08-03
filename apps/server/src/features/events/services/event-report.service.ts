import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Event } from '../../../entities/event.entity';
import { Registration } from '../../registrations/entities/registration.entity';
import { TicketType } from '../../../entities/ticket-type.entity';
import { 
  EventReportResponseDto, 
  RegistrationStatsDto, 
  RevenueStatsDto, 
  AttendanceStatsDto, 
  TimelineDataPointDto,
  TicketTypeStats 
} from '../dto/event-report.dto';

@Injectable()
export class EventReportService {
  private readonly logger = new Logger(EventReportService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>,
  ) {}

  async generateEventReport(eventId: string, organizerId: string): Promise<EventReportResponseDto> {
    this.logger.log(`Generating report for event: ${eventId}`);

    // Get event with relations
    const event = await this.eventRepository.findOne({
      where: { id: eventId, organizerId },
      relations: ['category', 'venue'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found or not owned by organizer`);
    }

    // Use Promise.all for parallel data fetching to improve performance
    const [registrations, ticketTypes] = await Promise.all([
      this.registrationRepository.find({
        where: { eventId },
        relations: ['user'],
      }),
      this.ticketTypeRepository.find({
        where: { eventId },
      }),
    ]);

    // Calculate all stats in parallel since they're independent
    const [registrationStats, revenueStats, attendanceStats, timeline] = await Promise.all([
      Promise.resolve(this.calculateRegistrationStats(registrations, ticketTypes)),
      Promise.resolve(this.calculateRevenueStats(registrations, ticketTypes)),
      Promise.resolve(this.calculateAttendanceStats(registrations)),
      this.generateTimelineData(eventId, event.createdAt, event.endDate),
    ]);

    return new EventReportResponseDto({
      eventId,
      eventDetails: event,
      registrationStats,
      revenue: revenueStats,
      attendanceStats,
      timeline,
    });
  }

  private calculateRegistrationStats(
    registrations: Registration[], 
    ticketTypes: TicketType[]
  ): RegistrationStatsDto {
    const byStatus = {
      pending: 0,
      paid: 0,
      cancelled: 0,
      checkedIn: 0,
    };

    const ticketTypeMap = new Map<string, TicketTypeStats>();
    
    // Initialize ticket type stats
    ticketTypes.forEach(ticketType => {
      ticketTypeMap.set(ticketType.id, {
        ticketTypeId: ticketType.id,
        ticketTypeName: ticketType.name,
        quantitySold: 0,
        revenue: 0,
      });
    });

    registrations.forEach(registration => {
      // Count by status
      byStatus[registration.status]++;

      // Count by ticket type (only for paid and checked in)
      if (registration.status === 'paid' || registration.status === 'checkedIn') {
        registration.ticketSelections.forEach(selection => {
          const stats = ticketTypeMap.get(selection.ticketTypeId);
          if (stats) {
            stats.quantitySold += selection.quantity;
            stats.revenue += selection.price * selection.quantity;
          }
        });
      }
    });

    return {
      total: registrations.length,
      byStatus,
      byTicketType: Array.from(ticketTypeMap.values()),
    };
  }

  private calculateRevenueStats(
    registrations: Registration[],
    ticketTypes: TicketType[]
  ): RevenueStatsDto {
    let gross = 0;
    let discountAmount = 0;

    const ticketTypeMap = new Map<string, TicketTypeStats>();
    
    // Initialize ticket type stats
    ticketTypes.forEach(ticketType => {
      ticketTypeMap.set(ticketType.id, {
        ticketTypeId: ticketType.id,
        ticketTypeName: ticketType.name,
        quantitySold: 0,
        revenue: 0,
      });
    });

    registrations.forEach(registration => {
      if (registration.status === 'paid' || registration.status === 'checkedIn') {
        gross += registration.totalAmount;
        discountAmount += registration.discountAmount || 0;

        // Calculate revenue by ticket type
        registration.ticketSelections.forEach(selection => {
          const stats = ticketTypeMap.get(selection.ticketTypeId);
          if (stats) {
            stats.revenue += selection.price * selection.quantity;
          }
        });
      }
    });

    return {
      gross,
      discountAmount,
      net: gross - discountAmount,
      byTicketType: Array.from(ticketTypeMap.values()),
    };
  }

  private calculateAttendanceStats(registrations: Registration[]): AttendanceStatsDto {
    const paidRegistrations = registrations.filter(
      r => r.status === 'paid' || r.status === 'checkedIn'
    );
    const checkedInRegistrations = registrations.filter(r => r.status === 'checkedIn');

    // Find the last check-in time
    let lastCheckInTime: string | undefined;
    const checkedInWithTime = registrations.filter(
      r => r.status === 'checkedIn' && r.checkedInAt
    );
    
    if (checkedInWithTime.length > 0) {
      const sortedByCheckIn = checkedInWithTime.sort(
        (a, b) => b.checkedInAt!.getTime() - a.checkedInAt!.getTime()
      );
      lastCheckInTime = sortedByCheckIn[0].checkedInAt!.toISOString();
    }

    const registered = paidRegistrations.length;
    const checkedIn = checkedInRegistrations.length;
    const rate = registered > 0 ? Number(((checkedIn / registered) * 100).toFixed(1)) : 0;

    return {
      registered,
      checkedIn,
      rate,
      lastCheckInTime,
    };
  }

  private async generateTimelineData(
    eventId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TimelineDataPointDto[]> {
    const timeline: TimelineDataPointDto[] = [];
    
    // Get all registrations ordered by creation date
    const registrations = await this.registrationRepository.find({
      where: { 
        eventId,
        status: In(['paid', 'checkedIn']),
      },
      order: { createdAt: 'ASC' },
    });

    if (registrations.length === 0) {
      return timeline;
    }

    // Group registrations by date
    const dailyData = new Map<string, { count: number; revenue: number }>();
    
    registrations.forEach(registration => {
      const dateKey = registration.createdAt.toISOString().split('T')[0];
      const existing = dailyData.get(dateKey) || { count: 0, revenue: 0 };
      existing.count++;
      existing.revenue += registration.totalAmount;
      dailyData.set(dateKey, existing);
    });

    // Generate timeline with cumulative data
    let cumulativeRegistrations = 0;
    let cumulativeRevenue = 0;

    const sortedDates = Array.from(dailyData.keys()).sort();
    
    sortedDates.forEach(date => {
      const dayData = dailyData.get(date)!;
      cumulativeRegistrations += dayData.count;
      cumulativeRevenue += dayData.revenue;

      timeline.push({
        date,
        registrations: dayData.count,
        revenue: dayData.revenue,
        cumulativeRegistrations,
        cumulativeRevenue,
      });
    });

    return timeline;
  }
}