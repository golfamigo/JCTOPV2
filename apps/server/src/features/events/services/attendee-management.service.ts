import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Registration } from '../../registrations/entities/registration.entity';
import { User } from '../../../entities/user.entity';
import { Event } from '../../../entities/event.entity';
import { AttendeeDto, AttendeeQueryDto, AttendeeListResponseDto } from '../dto/attendee.dto';

@Injectable()
export class AttendeeManagementService {
  constructor(
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async getEventAttendees(
    eventId: string,
    organizerId: string,
    query: AttendeeQueryDto
  ): Promise<AttendeeListResponseDto> {
    // Verify organizer owns the event
    const event = await this.eventRepository.findOne({
      where: { id: eventId, organizerId }
    });

    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    const { status, search, sortBy = 'createdAt', sortOrder = 'DESC', page = 1, limit = 20 } = query;

    // Build the query with joins
    let queryBuilder = this.registrationRepository
      .createQueryBuilder('registration')
      .leftJoinAndSelect('registration.user', 'user')
      .where('registration.eventId = :eventId', { eventId });

    // Apply status filter
    if (status) {
      queryBuilder = queryBuilder.andWhere('registration.status = :status', { status });
    }

    // Apply search filter with input sanitization
    if (search && search.trim().length > 0) {
      const sanitizedSearch = search.trim().replace(/[%_]/g, '\\$&');
      queryBuilder = queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${sanitizedSearch}%` }
      );
    }

    // Apply sorting
    const sortColumn = this.getSortColumn(sortBy);
    queryBuilder = queryBuilder.orderBy(sortColumn, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder = queryBuilder.skip(offset).take(limit);

    // Get results and total count
    const [registrations, total] = await queryBuilder.getManyAndCount();

    // Convert to DTOs
    const attendeeDtos = registrations.map(
      registration => new AttendeeDto(registration, registration.user)
    );

    return new AttendeeListResponseDto(attendeeDtos, total, page, limit);
  }

  async getAllEventAttendees(
    eventId: string,
    organizerId: string,
    query: Pick<AttendeeQueryDto, 'status' | 'search'>
  ): Promise<AttendeeDto[]> {
    // Verify organizer owns the event
    const event = await this.eventRepository.findOne({
      where: { id: eventId, organizerId }
    });

    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    const { status, search } = query;

    // Build the query without pagination for export
    let queryBuilder = this.registrationRepository
      .createQueryBuilder('registration')
      .leftJoinAndSelect('registration.user', 'user')
      .where('registration.eventId = :eventId', { eventId });

    // Apply status filter
    if (status) {
      queryBuilder = queryBuilder.andWhere('registration.status = :status', { status });
    }

    // Apply search filter with input sanitization
    if (search && search.trim().length > 0) {
      const sanitizedSearch = search.trim().replace(/[%_]/g, '\\$&');
      queryBuilder = queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${sanitizedSearch}%` }
      );
    }

    // Order by registration date
    queryBuilder = queryBuilder.orderBy('registration.createdAt', 'DESC');

    const registrations = await queryBuilder.getMany();

    return registrations.map(
      registration => new AttendeeDto(registration, registration.user)
    );
  }

  async getEventForExport(eventId: string, organizerId: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId, organizerId }
    });

    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    return event;
  }

  private getSortColumn(sortBy: string): string {
    const sortMap: Record<string, string> = {
      'createdAt': 'registration.createdAt',
      'status': 'registration.status',
      'userName': 'user.name',
      'finalAmount': 'registration.finalAmount'
    };

    return sortMap[sortBy] || 'registration.createdAt';
  }
}