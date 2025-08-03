import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Registration } from '../../registrations/entities/registration.entity';
import { Event } from '../../../entities/event.entity';
import { EventStatisticsResponseDto } from '../dto/event-statistics.dto';

@Injectable()
export class EventStatisticsService {
  private readonly logger = new Logger(EventStatisticsService.name);

  constructor(
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async getEventStatistics(eventId: string): Promise<EventStatisticsResponseDto> {
    this.logger.log(`Getting statistics for event: ${eventId}`);

    // Verify event exists
    const event = await this.eventRepository.findOne({
      where: { id: eventId }
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Get total registrations count (paid and checkedIn) - using proper TypeORM In operator
    const totalRegistrations = await this.registrationRepository.count({
      where: {
        eventId,
        status: In(['paid', 'checkedIn'])
      }
    });

    // Get checked-in count
    const checkedInCount = await this.registrationRepository.count({
      where: {
        eventId,
        status: 'checkedIn'
      }
    });

    this.logger.log(`Statistics for event ${eventId}: ${checkedInCount}/${totalRegistrations} checked in`);

    return new EventStatisticsResponseDto(
      eventId,
      totalRegistrations,
      checkedInCount
    );
  }

  async refreshStatistics(eventId: string): Promise<EventStatisticsResponseDto> {
    // For now, this just calls getEventStatistics
    // In the future, this could clear any caching
    return this.getEventStatistics(eventId);
  }
}