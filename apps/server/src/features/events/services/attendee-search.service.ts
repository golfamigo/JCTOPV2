import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Event } from '../../../entities/event.entity';
import { Registration } from '../../registrations/entities/registration.entity';
import { User } from '../../../entities/user.entity';
import { TicketType } from '../../../entities/ticket-type.entity';
import { AttendeeSearchQueryDto, AttendeeSearchResultDto, AttendeeSearchResponseDto } from '../dto/attendee-search.dto';

@Injectable()
export class AttendeeSearchService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>,
  ) {}

  async searchAttendees(
    eventId: string,
    organizerId: string,
    query: AttendeeSearchQueryDto,
  ): Promise<AttendeeSearchResponseDto> {
    // Input validation
    if (!eventId || !organizerId || !query.query) {
      throw new BadRequestException('Missing required parameters');
    }

    // Verify the event exists and user has access
    const event = await this.eventRepository.findOne({
      where: { id: eventId, organizerId },
    });

    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    // Build the search query with performance optimizations
    const queryBuilder = this.registrationRepository
      .createQueryBuilder('registration')
      .leftJoinAndSelect('registration.user', 'user')
      .where('registration.eventId = :eventId', { eventId })
      .andWhere('registration.status != :cancelledStatus', { cancelledStatus: 'cancelled' });

    // Sanitize and add search conditions
    const searchTerm = query.query.trim().toLowerCase();
    if (searchTerm.length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters long');
    }

    // Use indexed fields for better performance
    queryBuilder.andWhere(
      `(
        LOWER(user.name) LIKE :searchTerm OR 
        LOWER(user.email) LIKE :searchTerm OR 
        LOWER(registration.id) LIKE :searchTerm
      )`,
      { searchTerm: `%${searchTerm}%` }
    );

    // Clone query builder for count to avoid pagination interference
    const countQuery = queryBuilder.clone();
    const total = await countQuery.getCount();

    // Apply pagination and ordering
    queryBuilder
      .orderBy('user.name', 'ASC')
      .addOrderBy('registration.createdAt', 'DESC') // Secondary sort for consistency
      .skip(query.offset)
      .take(query.limit);

    // Execute query
    const registrations = await queryBuilder.getMany();

    // Get all ticket type IDs from registrations and fetch them
    const ticketTypeIds = new Set<string>();
    registrations.forEach(registration => {
      if (registration.ticketSelections && Array.isArray(registration.ticketSelections)) {
        registration.ticketSelections.forEach(selection => {
          if (selection.ticketTypeId) {
            ticketTypeIds.add(selection.ticketTypeId);
          }
        });
      }
    });

    // Fetch ticket types if any exist
    const ticketTypes = ticketTypeIds.size > 0 
      ? await this.ticketTypeRepository.find({
          where: { id: In(Array.from(ticketTypeIds)) }
        })
      : [];
    
    // Create a map for quick lookup
    const ticketTypeMap = new Map(ticketTypes.map(tt => [tt.id, tt]));

    // Transform to DTOs
    const attendees = registrations.map(registration => 
      new AttendeeSearchResultDto(registration, registration.user, ticketTypeMap)
    );

    return new AttendeeSearchResponseDto(attendees, total, query.limit, query.offset);
  }
}