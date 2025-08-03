import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../../entities/event.entity';
import { Registration } from '../../registrations/entities/registration.entity';
import { User } from '../../../entities/user.entity';
import { TicketType } from '../../../entities/ticket-type.entity';
import { QrCodeService } from '../../registrations/services/qr-code.service';
import { CheckInResponseDto } from '../../registrations/dto/checkin.dto';

@Injectable()
export class CheckInService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TicketType)
    private ticketTypeRepository: Repository<TicketType>,
    private qrCodeService: QrCodeService,
  ) {}

  async checkInAttendee(eventId: string, qrCode: string, organizerId: string): Promise<CheckInResponseDto> {
    // Verify the event exists and belongs to the organizer
    const event = await this.eventRepository.findOne({
      where: { id: eventId, organizerId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Decrypt and validate QR code
    let qrData: any;
    try {
      qrData = this.qrCodeService.decryptRegistrationData(qrCode);
    } catch (error) {
      throw new BadRequestException('Invalid QR code');
    }

    // Validate QR data structure
    if (!qrData || !qrData.registrationId || !qrData.userId || qrData.eventId !== eventId) {
      return {
        success: false,
        error: 'Invalid QR code format',
        errorCode: 'INVALID_QR_CODE',
      };
    }

    // Find the registration
    const registration = await this.registrationRepository.findOne({
      where: {
        id: qrData.registrationId,
        eventId: eventId,
        userId: qrData.userId,
      },
    });

    if (!registration) {
      return {
        success: false,
        error: 'Ticket not found',
        errorCode: 'TICKET_NOT_FOUND',
      };
    }

    // Check if already checked in
    if (registration.status === 'checkedIn') {
      return {
        success: false,
        error: 'This ticket has already been checked in',
        errorCode: 'ALREADY_CHECKED_IN',
      };
    }

    // Verify the registration is paid
    if (registration.status !== 'paid') {
      return {
        success: false,
        error: 'Ticket is not valid for check-in',
        errorCode: 'INVALID_QR_CODE',
      };
    }

    // Get user details
    const user = await this.userRepository.findOne({
      where: { id: qrData.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update registration status to checked in
    registration.status = 'checkedIn';
    registration.checkedInAt = new Date();
    await this.registrationRepository.save(registration);

    // Get ticket type name
    let ticketTypeName = 'General Admission';
    if (registration.ticketSelections && registration.ticketSelections.length > 0) {
      const ticketTypeId = registration.ticketSelections[0].ticketTypeId;
      const ticketType = await this.ticketTypeRepository.findOne({
        where: { id: ticketTypeId },
      });
      if (ticketType) {
        ticketTypeName = ticketType.name;
      }
    }

    return {
      success: true,
      attendee: {
        name: user.name,
        email: user.email,
        ticketType: ticketTypeName,
      },
    };
  }
}