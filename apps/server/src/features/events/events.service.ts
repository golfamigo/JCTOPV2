import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entities/event.entity';
import { TicketType } from '../../entities/ticket-type.entity';
import { SeatingZone } from '../../entities/seating-zone.entity';
import { Category } from '../../entities/category.entity';
import { Venue } from '../../entities/venue.entity';
import { DiscountCode } from '../../entities/discount-code.entity';
import { CustomRegistrationField } from '../../entities/custom-registration-field.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateTicketTypeDto, UpdateTicketTypeDto, CreateSeatingZoneDto, EventStatusChangeDto, CreateDiscountCodeDto, UpdateDiscountCodeDto, CreateCustomFieldDto, UpdateCustomFieldDto } from './dto';
import { PaginatedEventsResponse, EventWithRelations, TicketTypeWithAvailability, TicketSelection, TicketSelectionValidationResponse, CustomRegistrationField as CustomRegistrationFieldInterface, DiscountValidationResponse } from '@jctop-event/shared-types';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(TicketType)
    private ticketTypeRepository: Repository<TicketType>,
    @InjectRepository(SeatingZone)
    private seatingZoneRepository: Repository<SeatingZone>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
    @InjectRepository(DiscountCode)
    private discountCodeRepository: Repository<DiscountCode>,
    @InjectRepository(CustomRegistrationField)
    private customRegistrationFieldRepository: Repository<CustomRegistrationField>,
  ) {}

  async create(createEventDto: CreateEventDto, organizerId: string): Promise<Event> {
    const event = this.eventsRepository.create({
      ...createEventDto,
      organizerId,
      status: 'draft',
      startDate: new Date(createEventDto.startDate),
      endDate: new Date(createEventDto.endDate),
    });
    
    return this.eventsRepository.save(event);
  }

  private async verifyEventOwnership(eventId: string, userId: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('You are not authorized to manage this event');
    }

    return event;
  }

  // Ticket Type Management Methods
  async createTicketType(
    eventId: string,
    createTicketTypeDto: CreateTicketTypeDto,
    userId: string,
  ): Promise<TicketType> {
    await this.verifyEventOwnership(eventId, userId);

    const ticketType = this.ticketTypeRepository.create({
      ...createTicketTypeDto,
      eventId,
    });

    return this.ticketTypeRepository.save(ticketType);
  }

  async updateTicketType(
    eventId: string,
    ticketTypeId: string,
    updateTicketTypeDto: UpdateTicketTypeDto,
    userId: string,
  ): Promise<TicketType> {
    await this.verifyEventOwnership(eventId, userId);

    const ticketType = await this.ticketTypeRepository.findOne({
      where: { id: ticketTypeId, eventId },
    });

    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    Object.assign(ticketType, updateTicketTypeDto);
    return this.ticketTypeRepository.save(ticketType);
  }

  async deleteTicketType(
    eventId: string,
    ticketTypeId: string,
    userId: string,
  ): Promise<void> {
    await this.verifyEventOwnership(eventId, userId);

    const ticketType = await this.ticketTypeRepository.findOne({
      where: { id: ticketTypeId, eventId },
    });

    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    await this.ticketTypeRepository.remove(ticketType);
  }

  async getTicketTypes(eventId: string, userId: string): Promise<TicketType[]> {
    await this.verifyEventOwnership(eventId, userId);

    return this.ticketTypeRepository.find({
      where: { eventId },
      order: { name: 'ASC' },
    });
  }

  // Seating Zone Management Methods
  async createSeatingZone(
    eventId: string,
    createSeatingZoneDto: CreateSeatingZoneDto,
    userId: string,
  ): Promise<SeatingZone> {
    await this.verifyEventOwnership(eventId, userId);

    const seatingZone = this.seatingZoneRepository.create({
      ...createSeatingZoneDto,
      eventId,
    });

    return this.seatingZoneRepository.save(seatingZone);
  }

  async updateSeatingZone(
    eventId: string,
    zoneId: string,
    updateSeatingZoneDto: CreateSeatingZoneDto,
    userId: string,
  ): Promise<SeatingZone> {
    await this.verifyEventOwnership(eventId, userId);

    const seatingZone = await this.seatingZoneRepository.findOne({
      where: { id: zoneId, eventId },
    });

    if (!seatingZone) {
      throw new NotFoundException('Seating zone not found');
    }

    Object.assign(seatingZone, updateSeatingZoneDto);
    return this.seatingZoneRepository.save(seatingZone);
  }

  async deleteSeatingZone(
    eventId: string,
    zoneId: string,
    userId: string,
  ): Promise<void> {
    await this.verifyEventOwnership(eventId, userId);

    const seatingZone = await this.seatingZoneRepository.findOne({
      where: { id: zoneId, eventId },
    });

    if (!seatingZone) {
      throw new NotFoundException('Seating zone not found');
    }

    await this.seatingZoneRepository.remove(seatingZone);
  }

  async getSeatingZones(eventId: string, userId: string): Promise<SeatingZone[]> {
    await this.verifyEventOwnership(eventId, userId);

    return this.seatingZoneRepository.find({
      where: { eventId },
      order: { name: 'ASC' },
    });
  }

  // Status Management Methods
  private isValidStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): { isValid: boolean; reason?: string } {
    const validTransitions: Record<string, string[]> = {
      draft: ['published'],
      published: ['unpublished', 'paused', 'ended'],
      unpublished: ['published', 'ended'],
      paused: ['published', 'ended'],
      ended: [], // No transitions from ended
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    const isValid = allowedTransitions.includes(newStatus);

    if (!isValid) {
      let reason = `Cannot change status from '${currentStatus}' to '${newStatus}'.`;
      
      if (currentStatus === 'ended') {
        reason += ' Events that have ended cannot change status.';
      } else if (allowedTransitions.length > 0) {
        reason += ` Valid transitions from '${currentStatus}' are: ${allowedTransitions.join(', ')}.`;
      } else {
        reason += ' No valid transitions available.';
      }
      
      return { isValid: false, reason };
    }

    return { isValid: true };
  }

  async updateEventStatus(
    eventId: string,
    newStatus: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended',
    userId: string,
    reason?: string,
  ): Promise<Event> {
    const event = await this.verifyEventOwnership(eventId, userId);
    
    const transitionValidation = this.isValidStatusTransition(event.status, newStatus);
    if (!transitionValidation.isValid) {
      throw new BadRequestException(transitionValidation.reason);
    }

    const previousStatus = event.status;
    event.status = newStatus;
    
    const updatedEvent = await this.eventsRepository.save(event);

    // Create audit trail record
    this.logStatusChange(eventId, previousStatus, newStatus, userId, reason);

    return updatedEvent;
  }

  async findPublicEvents(): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { status: 'published' },
      order: { startDate: 'ASC' },
    });
  }

  async findPublicEventsPaginated(page: number = 1, limit: number = 10): Promise<PaginatedEventsResponse> {
    // Validate pagination parameters
    if (page < 1) page = 1;
    if (limit < 1) limit = 1;
    if (limit > 50) limit = 50; // Max limit to prevent abuse

    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.eventsRepository.count({
      where: { status: 'published' },
    });

    // Get paginated events with relations
    const events = await this.eventsRepository.find({
      where: { status: 'published' },
      relations: ['category', 'venue', 'ticketTypes'],
      order: { startDate: 'ASC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: events as EventWithRelations[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findPublicEventById(eventId: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId, status: 'published' },
    });

    if (!event) {
      throw new NotFoundException('Event not found or not published');
    }

    return event;
  }

  async findEventByIdForUser(eventId: string, userId: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // If user is the organizer, they can see any status
    if (event.organizerId === userId) {
      return event;
    }

    // If user is not the organizer, they can only see published events
    if (event.status !== 'published') {
      throw new NotFoundException('Event not found or not published');
    }

    return event;
  }

  // In-memory storage for demo purposes. In production, this should be stored in a database table.
  private statusChangeHistory: Map<string, EventStatusChangeDto[]> = new Map();

  private logStatusChange(
    eventId: string,
    previousStatus: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended',
    newStatus: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended',
    changedBy: string,
    reason?: string,
  ): void {
    const statusChange: EventStatusChangeDto = {
      eventId,
      previousStatus,
      newStatus,
      changedBy,
      changedAt: new Date(),
      reason,
    };

    const eventHistory = this.statusChangeHistory.get(eventId) || [];
    eventHistory.push(statusChange);
    this.statusChangeHistory.set(eventId, eventHistory);
  }

  async getEventStatusHistory(
    eventId: string,
    userId: string,
  ): Promise<EventStatusChangeDto[]> {
    await this.verifyEventOwnership(eventId, userId);

    return this.statusChangeHistory.get(eventId) || [];
  }

  // Discount Code Management Methods
  async createDiscountCode(
    eventId: string,
    createDiscountCodeDto: CreateDiscountCodeDto,
    userId: string,
  ): Promise<DiscountCode> {
    await this.verifyEventOwnership(eventId, userId);

    // Check if code already exists for this event
    const existingCode = await this.discountCodeRepository.findOne({
      where: { eventId, code: createDiscountCodeDto.code },
    });

    if (existingCode) {
      throw new BadRequestException('Discount code already exists for this event');
    }

    // Validate value
    if (createDiscountCodeDto.value <= 0) {
      throw new BadRequestException('Discount value must be greater than 0');
    }

    if (createDiscountCodeDto.type === 'percentage' && createDiscountCodeDto.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    // Validate expiration date
    if (createDiscountCodeDto.expiresAt) {
      const expiresAt = new Date(createDiscountCodeDto.expiresAt);
      if (expiresAt <= new Date()) {
        throw new BadRequestException('Expiration date must be in the future');
      }
    }

    const discountCode = this.discountCodeRepository.create({
      ...createDiscountCodeDto,
      eventId,
      expiresAt: createDiscountCodeDto.expiresAt ? new Date(createDiscountCodeDto.expiresAt) : null,
      usageCount: 0,
    });

    return this.discountCodeRepository.save(discountCode);
  }

  async getDiscountCodes(eventId: string, userId: string): Promise<DiscountCode[]> {
    await this.verifyEventOwnership(eventId, userId);

    return this.discountCodeRepository.find({
      where: { eventId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateDiscountCode(
    eventId: string,
    codeId: string,
    updateDiscountCodeDto: UpdateDiscountCodeDto,
    userId: string,
  ): Promise<DiscountCode> {
    await this.verifyEventOwnership(eventId, userId);

    const discountCode = await this.discountCodeRepository.findOne({
      where: { id: codeId, eventId },
    });

    if (!discountCode) {
      throw new NotFoundException('Discount code not found');
    }

    // If updating the code name, check if it already exists
    if (updateDiscountCodeDto.code && updateDiscountCodeDto.code !== discountCode.code) {
      const existingCode = await this.discountCodeRepository.findOne({
        where: { eventId, code: updateDiscountCodeDto.code },
      });

      if (existingCode) {
        throw new BadRequestException('Discount code already exists for this event');
      }
    }

    // Validate value if provided
    if (updateDiscountCodeDto.value !== undefined) {
      if (updateDiscountCodeDto.value <= 0) {
        throw new BadRequestException('Discount value must be greater than 0');
      }

      const newType = updateDiscountCodeDto.type || discountCode.type;
      if (newType === 'percentage' && updateDiscountCodeDto.value > 100) {
        throw new BadRequestException('Percentage discount cannot exceed 100%');
      }
    }

    // Validate expiration date
    if (updateDiscountCodeDto.expiresAt) {
      const expiresAt = new Date(updateDiscountCodeDto.expiresAt);
      if (expiresAt <= new Date()) {
        throw new BadRequestException('Expiration date must be in the future');
      }
    }

    Object.assign(discountCode, {
      ...updateDiscountCodeDto,
      expiresAt: updateDiscountCodeDto.expiresAt ? new Date(updateDiscountCodeDto.expiresAt) : discountCode.expiresAt,
    });

    return this.discountCodeRepository.save(discountCode);
  }

  async deleteDiscountCode(
    eventId: string,
    codeId: string,
    userId: string,
  ): Promise<void> {
    await this.verifyEventOwnership(eventId, userId);

    const discountCode = await this.discountCodeRepository.findOne({
      where: { id: codeId, eventId },
    });

    if (!discountCode) {
      throw new NotFoundException('Discount code not found');
    }

    await this.discountCodeRepository.remove(discountCode);
  }

  // This method will be used by RegistrationService to apply discount
  async applyDiscountCode(eventId: string, code: string, amount: number): Promise<{ discountedAmount: number; discountCodeId: string }> {
    // Use a more efficient query with select to reduce data transfer
    const discount = await this.discountCodeRepository.findOne({
      where: { eventId, code },
      select: ['id', 'type', 'value', 'expiresAt'], // Only select needed fields for performance
    });

    if (!discount) {
      throw new BadRequestException('Invalid discount code');
    }

    if (discount.expiresAt && discount.expiresAt < new Date()) {
      throw new BadRequestException('Discount code has expired');
    }

    // Calculate discounted amount with better precision handling
    let discountedAmount: number;
    if (discount.type === 'percentage') {
      discountedAmount = Math.round((amount - (amount * discount.value / 100)) * 100) / 100;
    } else {
      discountedAmount = Math.max(0, Math.round((amount - discount.value) * 100) / 100);
    }

    // Increment usage count atomically
    await this.discountCodeRepository.increment(
      { id: discount.id },
      'usageCount',
      1
    );

    return { discountedAmount, discountCodeId: discount.id };
  }

  // Public ticket selection methods for registration flow
  async getPublicTicketTypesWithAvailability(eventId: string): Promise<TicketTypeWithAvailability[]> {
    // First verify event exists and is published
    const event = await this.eventsRepository.findOne({
      where: { id: eventId, status: 'published' },
    });

    if (!event) {
      throw new NotFoundException('Event not found or not available for registration');
    }

    const ticketTypes = await this.ticketTypeRepository.find({
      where: { eventId },
      order: { name: 'ASC' },
    });

    // For now, return with simple availability calculation
    // TODO: In future, we'll calculate actual sold quantities from registrations
    return ticketTypes.map(ticketType => ({
      id: ticketType.id,
      eventId: ticketType.eventId,
      name: ticketType.name,
      price: ticketType.price,
      totalQuantity: ticketType.quantity,
      availableQuantity: ticketType.quantity, // TODO: Subtract actual sold quantity
      soldQuantity: 0, // TODO: Calculate from registrations
    }));
  }

  async validateTicketSelection(eventId: string, selections: TicketSelection[]): Promise<TicketSelectionValidationResponse> {
    // Verify event exists and is published
    const event = await this.eventsRepository.findOne({
      where: { id: eventId, status: 'published' },
    });

    if (!event) {
      throw new NotFoundException('Event not found or not available for registration');
    }

    const errors: { ticketTypeId: string; message: string }[] = [];

    // Get all ticket types for validation
    const ticketTypes = await this.ticketTypeRepository.find({
      where: { eventId },
    });

    const ticketTypeMap = new Map(ticketTypes.map(tt => [tt.id, tt]));

    for (const selection of selections) {
      const ticketType = ticketTypeMap.get(selection.ticketTypeId);

      if (!ticketType) {
        errors.push({
          ticketTypeId: selection.ticketTypeId,
          message: 'Ticket type not found',
        });
        continue;
      }

      if (selection.quantity <= 0) {
        errors.push({
          ticketTypeId: selection.ticketTypeId,
          message: 'Quantity must be greater than 0',
        });
        continue;
      }

      // TODO: Check against actual available quantity (after implementing registrations)
      if (selection.quantity > ticketType.quantity) {
        errors.push({
          ticketTypeId: selection.ticketTypeId,
          message: `Only ${ticketType.quantity} tickets available`,
        });
        continue;
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // Custom Registration Field Methods
  async getCustomRegistrationFields(eventId: string): Promise<CustomRegistrationFieldInterface[]> {
    // Check if event exists
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const fields = await this.customRegistrationFieldRepository.find({
      where: { eventId },
      order: { order: 'ASC' },
    });

    return fields;
  }

  async createCustomRegistrationField(
    eventId: string,
    createCustomFieldDto: CreateCustomFieldDto,
    userId: string,
  ): Promise<CustomRegistrationField> {
    await this.verifyEventOwnership(eventId, userId);

    const field = this.customRegistrationFieldRepository.create({
      ...createCustomFieldDto,
      eventId,
    });

    return this.customRegistrationFieldRepository.save(field);
  }

  async updateCustomRegistrationField(
    eventId: string,
    fieldId: string,
    updateCustomFieldDto: UpdateCustomFieldDto,
    userId: string,
  ): Promise<CustomRegistrationField> {
    await this.verifyEventOwnership(eventId, userId);

    const field = await this.customRegistrationFieldRepository.findOne({
      where: { id: fieldId, eventId },
    });

    if (!field) {
      throw new NotFoundException('Custom field not found');
    }

    Object.assign(field, updateCustomFieldDto);
    return this.customRegistrationFieldRepository.save(field);
  }

  async deleteCustomRegistrationField(
    eventId: string,
    fieldId: string,
    userId: string,
  ): Promise<void> {
    await this.verifyEventOwnership(eventId, userId);

    const field = await this.customRegistrationFieldRepository.findOne({
      where: { id: fieldId, eventId },
    });

    if (!field) {
      throw new NotFoundException('Custom field not found');
    }

    await this.customRegistrationFieldRepository.remove(field);
  }

  // Discount Validation Method
  async validateDiscountCode(
    eventId: string,
    code: string,
    totalAmount: number,
  ): Promise<DiscountValidationResponse> {
    // Check if event exists
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const discountCode = await this.discountCodeRepository.findOne({
      where: { eventId, code },
    });

    if (!discountCode) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: totalAmount,
        errorMessage: 'Invalid discount code',
      };
    }

    // Check if discount code is expired
    if (discountCode.expiresAt && new Date() > discountCode.expiresAt) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: totalAmount,
        errorMessage: 'Discount code has expired',
      };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discountCode.type === 'percentage') {
      discountAmount = (totalAmount * discountCode.value) / 100;
    } else if (discountCode.type === 'fixed_amount') {
      discountAmount = Math.min(discountCode.value, totalAmount);
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    return {
      valid: true,
      discountAmount,
      finalAmount,
    };
  }
}