import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entities/event.entity';
import { EventResponseDto } from '../events/dto';

@Injectable()
export class OrganizerService {
  private readonly logger = new Logger(OrganizerService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async getOrganizerEvents(organizerId: string): Promise<EventResponseDto[]> {
    this.logger.log(`Getting events for organizer: ${organizerId}`);

    const events = await this.eventRepository.find({
      where: { organizerId },
      relations: ['category', 'venue'],
      order: { createdAt: 'DESC' }
    });

    return events.map(event => new EventResponseDto(event));
  }
}