import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registration } from '../entities/registration.entity';
import { QrCodeService } from './qr-code.service';
import { EmailService } from '../../notifications/services/email.service';
import { Payment } from '../../payments/entities/payment.entity';
import { Event } from '../../../entities/event.entity';
import { User } from '../../../entities/user.entity';

@Injectable()
export class RegistrationCompletionService {
  constructor(
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private qrCodeService: QrCodeService,
    private emailService: EmailService,
  ) {}

  async processPaymentSuccess(paymentId: string): Promise<Registration> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'completed') {
      throw new BadRequestException('Payment is not completed');
    }

    const registration = await this.registrationRepository.findOne({
      where: { paymentId: payment.id },
      relations: ['user', 'event']
    });

    if (!registration) {
      throw new NotFoundException('Registration not found for this payment');
    }

    if (registration.status === 'paid') {
      return registration;
    }

    const qrCode = await this.qrCodeService.generateRegistrationQrCode({
      registrationId: registration.id,
      eventId: registration.eventId,
      userId: registration.userId
    });

    await this.registrationRepository.update(registration.id, {
      status: 'paid',
      paymentStatus: 'completed',
      qrCode
    });

    const updatedRegistration = await this.registrationRepository.findOne({
      where: { id: registration.id },
      relations: ['user', 'event']
    });

    await this.sendConfirmationEmail(updatedRegistration);

    return updatedRegistration;
  }

  private async sendConfirmationEmail(registration: Registration): Promise<void> {
    const event = registration.event;
    const user = registration.user;

    const emailData = {
      to: user.email,
      subject: `Registration Confirmed - ${event.title}`,
      templateData: {
        userName: user.name,
        eventTitle: event.title,
        eventDate: event.startDate,
        eventLocation: event.location,
        registrationId: registration.id,
        qrCode: registration.qrCode,
        ticketSelections: registration.ticketSelections,
        totalAmount: registration.finalAmount,
        currency: 'TWD'
      },
      template: 'registration-confirmation'
    };

    try {
      await this.emailService.sendEmail(emailData);
      console.log(`Confirmation email sent successfully to ${user.email} for registration ${registration.id}`);
    } catch (error) {
      console.error('Failed to send confirmation email:', {
        registrationId: registration.id,
        userEmail: user.email,
        error: error.message
      });
      // Note: Email failure should not fail the entire registration completion
      // The user has successfully paid and registration is complete
    }
  }

  async getRegistrationById(registrationId: string, userId: string): Promise<Registration> {
    const registration = await this.registrationRepository.findOne({
      where: { 
        id: registrationId,
        userId 
      },
      relations: ['event', 'user']
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return registration;
  }

  async getUserRegistrations(userId: string, status?: 'paid' | 'cancelled' | 'checkedIn'): Promise<Registration[]> {
    const where: any = { userId };
    
    if (status) {
      where.status = status;
    }

    return await this.registrationRepository.find({
      where,
      relations: ['event'],
      order: {
        createdAt: 'DESC'
      }
    });
  }
}