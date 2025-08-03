import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AppModule } from '../../app.module';
import { User } from '../../entities/user.entity';
import { Event } from '../../entities/event.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { TicketType } from '../../entities/ticket-type.entity';
import { Category } from '../../entities/category.entity';
import { Venue } from '../../entities/venue.entity';
import { InvoiceSettings } from '../invoicing/entities/invoice-settings.entity';

describe('Events Reporting (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let eventRepository: Repository<Event>;
  let registrationRepository: Repository<Registration>;
  let ticketTypeRepository: Repository<TicketType>;
  let categoryRepository: Repository<Category>;
  let venueRepository: Repository<Venue>;
  let invoiceSettingsRepository: Repository<InvoiceSettings>;

  let organizerUser: User;
  let testEvent: Event;
  let testCategory: Category;
  let testVenue: Venue;
  let testTicketTypes: TicketType[];
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get repositories
    userRepository = app.get('UserRepository');
    eventRepository = app.get('EventRepository');
    registrationRepository = app.get('RegistrationRepository');
    ticketTypeRepository = app.get('TicketTypeRepository');
    categoryRepository = app.get('CategoryRepository');
    venueRepository = app.get('VenueRepository');
    invoiceSettingsRepository = app.get('InvoiceSettingsRepository');

    // Set up test data
    await setupTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    await app.close();
  });

  async function setupTestData() {
    // Create organizer user
    organizerUser = userRepository.create({
      name: 'Test Organizer',
      email: 'organizer@test.com',
      authProvider: 'email',
      passwordHash: 'hashedpassword',
    });
    await userRepository.save(organizerUser);

    // Create category
    testCategory = categoryRepository.create({
      name: 'Test Category',
      description: 'Test category description',
      color: '#FF0000',
    });
    await categoryRepository.save(testCategory);

    // Create venue
    testVenue = venueRepository.create({
      name: 'Test Venue',
      address: '123 Test St',
      city: 'Test City',
      capacity: 100,
      description: 'Test venue description',
    });
    await venueRepository.save(testVenue);

    // Create event
    testEvent = eventRepository.create({
      title: 'Test Event for Reporting',
      description: 'Event to test reporting features',
      startDate: new Date('2024-01-01T10:00:00Z'),
      endDate: new Date('2024-01-01T18:00:00Z'),
      location: 'Test Location',
      status: 'ended',
      organizerId: organizerUser.id,
      categoryId: testCategory.id,
      venueId: testVenue.id,
    });
    await eventRepository.save(testEvent);

    // Create ticket types
    const generalTicket = ticketTypeRepository.create({
      eventId: testEvent.id,
      name: 'General Admission',
      price: 50,
      quantity: 100,
    });

    const vipTicket = ticketTypeRepository.create({
      eventId: testEvent.id,
      name: 'VIP',
      price: 150,
      quantity: 20,
    });

    testTicketTypes = await ticketTypeRepository.save([generalTicket, vipTicket]);

    // Create test registrations
    const registrations = [];

    // 3 paid general admission tickets
    for (let i = 0; i < 3; i++) {
      const registration = registrationRepository.create({
        userId: organizerUser.id, // Using organizer as attendee for simplicity
        eventId: testEvent.id,
        status: 'paid',
        paymentStatus: 'completed',
        totalAmount: 50,
        discountAmount: i === 0 ? 5 : 0, // First registration has discount
        finalAmount: i === 0 ? 45 : 50,
        customFieldValues: {},
        ticketSelections: [
          {
            ticketTypeId: testTicketTypes[0].id,
            quantity: 1,
            price: 50,
          },
        ],
        checkedInAt: i < 2 ? new Date('2024-01-01T09:00:00Z') : null, // 2 checked in
      });
      registrations.push(registration);
    }

    // 2 paid VIP tickets
    for (let i = 0; i < 2; i++) {
      const registration = registrationRepository.create({
        userId: organizerUser.id,
        eventId: testEvent.id,
        status: 'paid',
        paymentStatus: 'completed',
        totalAmount: 150,
        discountAmount: 0,
        finalAmount: 150,
        customFieldValues: {},
        ticketSelections: [
          {
            ticketTypeId: testTicketTypes[1].id,
            quantity: 1,
            price: 150,
          },
        ],
        checkedInAt: i === 0 ? new Date('2024-01-01T09:30:00Z') : null, // 1 checked in
      });
      registrations.push(registration);
    }

    // 1 cancelled registration
    const cancelledRegistration = registrationRepository.create({
      userId: organizerUser.id,
      eventId: testEvent.id,
      status: 'cancelled',
      paymentStatus: 'cancelled',
      totalAmount: 50,
      discountAmount: 0,
      finalAmount: 50,
      customFieldValues: {},
      ticketSelections: [
        {
          ticketTypeId: testTicketTypes[0].id,
          quantity: 1,
          price: 50,
        },
      ],
    });
    registrations.push(cancelledRegistration);

    await registrationRepository.save(registrations);

    // Get auth token (simplified - in real app this would go through proper auth)
    authToken = 'mock-jwt-token'; // This would need proper JWT generation
  }

  async function cleanupTestData() {
    await registrationRepository.delete({ eventId: testEvent.id });
    await ticketTypeRepository.delete({ eventId: testEvent.id });
    await invoiceSettingsRepository.delete({ eventId: testEvent.id });
    await eventRepository.delete({ id: testEvent.id });
    await categoryRepository.delete({ id: testCategory.id });
    await venueRepository.delete({ id: testVenue.id });
    await userRepository.delete({ id: organizerUser.id });
  }

  describe('GET /api/v1/events/:eventId/report', () => {
    it('should generate comprehensive event report', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/events/${testEvent.id}/report`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const report = response.body;

      // Verify report structure
      expect(report).toHaveProperty('eventId', testEvent.id);
      expect(report).toHaveProperty('eventDetails');
      expect(report).toHaveProperty('registrationStats');
      expect(report).toHaveProperty('revenue');
      expect(report).toHaveProperty('attendanceStats');
      expect(report).toHaveProperty('timeline');
      expect(report).toHaveProperty('generatedAt');

      // Verify event details
      expect(report.eventDetails.title).toBe('Test Event for Reporting');
      expect(report.eventDetails.status).toBe('ended');

      // Verify registration stats
      expect(report.registrationStats.total).toBe(6); // 5 paid + 1 cancelled
      expect(report.registrationStats.byStatus.paid).toBe(5);
      expect(report.registrationStats.byStatus.cancelled).toBe(1);
      expect(report.registrationStats.byStatus.checkedIn).toBe(0); // These become 'paid' status

      // Verify ticket type breakdown
      expect(report.registrationStats.byTicketType).toHaveLength(2);
      const generalTicketStats = report.registrationStats.byTicketType.find(
        (t: any) => t.ticketTypeName === 'General Admission'
      );
      expect(generalTicketStats.quantitySold).toBe(3);
      expect(generalTicketStats.revenue).toBe(150); // 3 * 50

      const vipTicketStats = report.registrationStats.byTicketType.find(
        (t: any) => t.ticketTypeName === 'VIP'
      );
      expect(vipTicketStats.quantitySold).toBe(2);
      expect(vipTicketStats.revenue).toBe(300); // 2 * 150

      // Verify revenue stats
      expect(report.revenue.gross).toBe(450); // 150 + 300
      expect(report.revenue.discountAmount).toBe(5); // Only first registration had discount
      expect(report.revenue.net).toBe(445);

      // Verify attendance stats
      expect(report.attendanceStats.registered).toBe(5); // paid registrations
      expect(report.attendanceStats.checkedIn).toBe(3); // 2 general + 1 VIP
      expect(report.attendanceStats.rate).toBe(60); // 3/5 * 100
      expect(report.attendanceStats.lastCheckInTime).toBeDefined();
    });

    it('should return 404 for non-existent event', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/events/nonexistent-id/report')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/events/:eventId/report/export', () => {
    it('should export report as PDF', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/events/${testEvent.id}/report/export?format=pdf`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('.pdf');
      expect(response.body).toBeInstanceOf(Buffer);
    });

    it('should export report as CSV', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/events/${testEvent.id}/report/export?format=csv`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toBe('text/csv');
      expect(response.headers['content-disposition']).toContain('.csv');
      expect(response.text).toContain('Event Report');
      expect(response.text).toContain('Test Event for Reporting');
    });

    it('should export report as Excel', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/events/${testEvent.id}/report/export?format=excel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(response.headers['content-disposition']).toContain('.xlsx');
      expect(response.body).toBeInstanceOf(Buffer);
    });
  });

  describe('Invoice Settings CRUD', () => {
    it('should create invoice settings', async () => {
      const invoiceSettings = {
        companyName: 'Test Company Ltd',
        companyAddress: '456 Business Ave\nSuite 100\nBusiness City, BC 12345',
        taxNumber: 'TAX-123456789',
        invoicePrefix: 'TEST-',
        invoiceFooter: 'Thank you for your business. Payment due within 30 days.',
        customFields: {
          website: 'https://testcompany.com',
          phone: '+1-555-123-4567',
        },
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/events/${testEvent.id}/invoice-settings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceSettings)
        .expect(201);

      expect(response.body).toMatchObject(invoiceSettings);
      expect(response.body.id).toBeDefined();
      expect(response.body.eventId).toBe(testEvent.id);
    });

    it('should get invoice settings', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/events/${testEvent.id}/invoice-settings`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.companyName).toBe('Test Company Ltd');
      expect(response.body.eventId).toBe(testEvent.id);
    });

    it('should update invoice settings', async () => {
      const updates = {
        companyName: 'Updated Test Company Ltd',
        taxNumber: 'UPDATED-TAX-123',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/events/${testEvent.id}/invoice-settings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.companyName).toBe('Updated Test Company Ltd');
      expect(response.body.taxNumber).toBe('UPDATED-TAX-123');
      // Other fields should remain unchanged
      expect(response.body.invoicePrefix).toBe('TEST-');
    });

    it('should delete invoice settings', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/events/${testEvent.id}/invoice-settings`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/api/v1/events/${testEvent.id}/invoice-settings`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeNull();
        });
    });

    it('should return 409 when trying to create duplicate invoice settings', async () => {
      // First creation should succeed
      await request(app.getHttpServer())
        .post(`/api/v1/events/${testEvent.id}/invoice-settings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ companyName: 'Test Company' })
        .expect(201);

      // Second creation should fail
      await request(app.getHttpServer())
        .post(`/api/v1/events/${testEvent.id}/invoice-settings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ companyName: 'Another Company' })
        .expect(409);
    });
  });

  describe('Report Access Control', () => {
    it('should deny access to reports for non-organizer', async () => {
      // Create another user
      const otherUser = userRepository.create({
        name: 'Other User',
        email: 'other@test.com',
        authProvider: 'email',
        passwordHash: 'hashedpassword',
      });
      await userRepository.save(otherUser);

      // This would need proper JWT token for other user
      const otherUserToken = 'other-user-token';

      await request(app.getHttpServer())
        .get(`/api/v1/events/${testEvent.id}/report`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(404); // Should not find event (access control)

      // Clean up
      await userRepository.delete({ id: otherUser.id });
    });

    it('should require authentication for all report endpoints', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/events/${testEvent.id}/report`)
        .expect(401);

      await request(app.getHttpServer())
        .get(`/api/v1/events/${testEvent.id}/report/export`)
        .expect(401);

      await request(app.getHttpServer())
        .get(`/api/v1/events/${testEvent.id}/invoice-settings`)
        .expect(401);
    });
  });
});