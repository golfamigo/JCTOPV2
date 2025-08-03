import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketType } from './ticket-type.entity';
import { Event } from './event.entity';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Venue } from './venue.entity';
import { getTestDatabaseConfig } from '../config/test-database.config';

describe('TicketType Entity', () => {
  let ticketTypeRepository: Repository<TicketType>;
  let eventRepository: Repository<Event>;
  let userRepository: Repository<User>;
  let categoryRepository: Repository<Category>;
  let venueRepository: Repository<Venue>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getTestDatabaseConfig()),
        TypeOrmModule.forFeature([TicketType, Event, User, Category, Venue]),
      ],
    }).compile();

    ticketTypeRepository = module.get<Repository<TicketType>>(getRepositoryToken(TicketType));
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
    venueRepository = module.get<Repository<Venue>>(getRepositoryToken(Venue));
  }, 30000);

  afterAll(async () => {
    await module.close();
  });

  afterEach(async () => {
    await ticketTypeRepository.clear();
    await eventRepository.clear();
    await userRepository.clear();
    await categoryRepository.clear();
    await venueRepository.clear();
  });

  async function createTestEvent() {
    const user = userRepository.create({
      name: 'Test Organizer',
      email: 'organizer@example.com',
      authProvider: 'email',
    });
    const savedUser = await userRepository.save(user);

    const category = categoryRepository.create({
      name: 'Test Category',
      color: '#3b82f6',
    });
    const savedCategory = await categoryRepository.save(category);

    const venue = venueRepository.create({
      name: 'Test Venue',
      capacity: 500,
    });
    const savedVenue = await venueRepository.save(venue);

    const event = eventRepository.create({
      organizerId: savedUser.id,
      categoryId: savedCategory.id,
      venueId: savedVenue.id,
      title: 'Test Event',
      startDate: new Date('2024-06-01T10:00:00Z'),
      endDate: new Date('2024-06-01T18:00:00Z'),
    });
    return await eventRepository.save(event);
  }

  describe('Entity Creation', () => {
    it('should create a ticket type with valid data', async () => {
      const event = await createTestEvent();

      const ticketTypeData = {
        eventId: event.id,
        name: 'General Admission',
        price: 49.99,
        quantity: 100,
      };

      const ticketType = ticketTypeRepository.create(ticketTypeData);
      const savedTicketType = await ticketTypeRepository.save(ticketType);

      expect(savedTicketType.id).toBeDefined();
      expect(savedTicketType.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(savedTicketType.eventId).toBe(event.id);
      expect(savedTicketType.name).toBe(ticketTypeData.name);
      expect(Number(savedTicketType.price)).toBe(ticketTypeData.price);
      expect(savedTicketType.quantity).toBe(ticketTypeData.quantity);
      expect(savedTicketType.createdAt).toBeInstanceOf(Date);
      expect(savedTicketType.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a ticket type with default price', async () => {
      const event = await createTestEvent();

      const ticketTypeData = {
        eventId: event.id,
        name: 'Free Ticket',
        quantity: 50,
      };

      const ticketType = ticketTypeRepository.create(ticketTypeData);
      const savedTicketType = await ticketTypeRepository.save(ticketType);

      expect(savedTicketType.id).toBeDefined();
      expect(savedTicketType.name).toBe(ticketTypeData.name);
      expect(Number(savedTicketType.price)).toBe(0);
      expect(savedTicketType.quantity).toBe(ticketTypeData.quantity);
    });

    it('should create multiple ticket types for the same event', async () => {
      const event = await createTestEvent();

      const ticketTypesData = [
        { name: 'Early Bird', price: 29.99, quantity: 50 },
        { name: 'Regular', price: 39.99, quantity: 100 },
        { name: 'VIP', price: 99.99, quantity: 20 },
      ];

      for (const ticketTypeData of ticketTypesData) {
        const ticketType = ticketTypeRepository.create({
          eventId: event.id,
          ...ticketTypeData,
        });
        const savedTicketType = await ticketTypeRepository.save(ticketType);

        expect(savedTicketType.name).toBe(ticketTypeData.name);
        expect(Number(savedTicketType.price)).toBe(ticketTypeData.price);
        expect(savedTicketType.quantity).toBe(ticketTypeData.quantity);
      }

      const allTicketTypes = await ticketTypeRepository.find({
        where: { eventId: event.id }
      });

      expect(allTicketTypes).toHaveLength(3);
    });
  });

  describe('Entity Validation', () => {
    it('should fail to save ticket type without required eventId', async () => {
      const invalidTicketTypeData = {
        name: 'Invalid Ticket',
        price: 25.00,
        quantity: 100,
      };

      const ticketType = ticketTypeRepository.create(invalidTicketTypeData);
      
      await expect(ticketTypeRepository.save(ticketType)).rejects.toThrow();
    });

    it('should fail to save ticket type without required name', async () => {
      const event = await createTestEvent();

      const invalidTicketTypeData = {
        eventId: event.id,
        price: 30.00,
        quantity: 75,
      };

      const ticketType = ticketTypeRepository.create(invalidTicketTypeData);
      
      await expect(ticketTypeRepository.save(ticketType)).rejects.toThrow();
    });

    it('should fail to save ticket type without required quantity', async () => {
      const event = await createTestEvent();

      const invalidTicketTypeData = {
        eventId: event.id,
        name: 'Standard Ticket',
        price: 35.00,
      };

      const ticketType = ticketTypeRepository.create(invalidTicketTypeData);
      
      await expect(ticketTypeRepository.save(ticketType)).rejects.toThrow();
    });

    it('should handle decimal prices correctly', async () => {
      const event = await createTestEvent();

      const ticketTypeData = {
        eventId: event.id,
        name: 'Decimal Price Ticket',
        price: 123.45,
        quantity: 25,
      };

      const ticketType = ticketTypeRepository.create(ticketTypeData);
      const savedTicketType = await ticketTypeRepository.save(ticketType);

      expect(Number(savedTicketType.price)).toBe(123.45);
    });
  });

  describe('Foreign Key Relationships', () => {
    it('should load ticket type with related event', async () => {
      const event = await createTestEvent();

      const ticketType = ticketTypeRepository.create({
        eventId: event.id,
        name: 'Standard Ticket',
        price: 45.00,
        quantity: 200,
      });
      const savedTicketType = await ticketTypeRepository.save(ticketType);

      const ticketTypeWithEvent = await ticketTypeRepository.findOne({
        where: { id: savedTicketType.id },
        relations: ['event'],
      });

      expect(ticketTypeWithEvent).toBeDefined();
      expect(ticketTypeWithEvent!.event).toBeDefined();
      expect(ticketTypeWithEvent!.event.title).toBe('Test Event');
    });

    it('should fail to create ticket type with non-existent event', async () => {
      const invalidTicketTypeData = {
        eventId: '00000000-0000-0000-0000-000000000000',
        name: 'Invalid Event Ticket',
        price: 25.00,
        quantity: 50,
      };

      const ticketType = ticketTypeRepository.create(invalidTicketTypeData);
      
      await expect(ticketTypeRepository.save(ticketType)).rejects.toThrow();
    });

    it('should cascade delete when event is deleted', async () => {
      const event = await createTestEvent();

      const ticketType = ticketTypeRepository.create({
        eventId: event.id,
        name: 'Cascade Test Ticket',
        price: 30.00,
        quantity: 100,
      });
      const savedTicketType = await ticketTypeRepository.save(ticketType);

      // Verify ticket type exists
      const foundTicketType = await ticketTypeRepository.findOne({
        where: { id: savedTicketType.id }
      });
      expect(foundTicketType).toBeDefined();

      // Delete the event
      await eventRepository.remove(event);

      // Verify ticket type was cascade deleted
      const deletedTicketType = await ticketTypeRepository.findOne({
        where: { id: savedTicketType.id }
      });
      expect(deletedTicketType).toBeNull();
    });
  });

  describe('Database Constraints', () => {
    it('should update the updatedAt timestamp when modified', async () => {
      const event = await createTestEvent();

      const ticketType = ticketTypeRepository.create({
        eventId: event.id,
        name: 'Update Test Ticket',
        price: 40.00,
        quantity: 150,
      });
      const savedTicketType = await ticketTypeRepository.save(ticketType);
      const originalUpdatedAt = savedTicketType.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 1100));

      savedTicketType.price = 45.00;
      const updatedTicketType = await ticketTypeRepository.save(savedTicketType);

      expect(updatedTicketType.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
      expect(Number(updatedTicketType.price)).toBe(45.00);
    });

    it('should handle zero price tickets', async () => {
      const event = await createTestEvent();

      const ticketTypeData = {
        eventId: event.id,
        name: 'Free Entry',
        price: 0,
        quantity: 1000,
      };

      const ticketType = ticketTypeRepository.create(ticketTypeData);
      const savedTicketType = await ticketTypeRepository.save(ticketType);

      expect(Number(savedTicketType.price)).toBe(0);
    });

    it('should handle negative quantity values', async () => {
      const event = await createTestEvent();

      const ticketTypeData = {
        eventId: event.id,
        name: 'Negative Quantity Test',
        price: 25.00,
        quantity: -10,
      };

      const ticketType = ticketTypeRepository.create(ticketTypeData);
      const savedTicketType = await ticketTypeRepository.save(ticketType);

      expect(savedTicketType.quantity).toBe(-10);
    });
  });

  describe('TypeORM Repository Integration', () => {
    it('should find ticket types by event', async () => {
      const event1 = await createTestEvent();
      
      // Create second event for comparison
      const user = await userRepository.findOne({ where: { email: 'organizer@example.com' } });
      const category = await categoryRepository.findOne({ where: { name: 'Test Category' } });
      const venue = await venueRepository.findOne({ where: { name: 'Test Venue' } });
      
      const event2 = eventRepository.create({
        organizerId: user!.id,
        categoryId: category!.id,
        venueId: venue!.id,
        title: 'Second Test Event',
        startDate: new Date('2024-07-01T10:00:00Z'),
        endDate: new Date('2024-07-01T18:00:00Z'),
      });
      const savedEvent2 = await eventRepository.save(event2);

      // Create ticket types for both events
      const ticketTypesData = [
        { eventId: event1.id, name: 'Event1 Early Bird', price: 20.00, quantity: 50 },
        { eventId: event1.id, name: 'Event1 Regular', price: 30.00, quantity: 100 },
        { eventId: savedEvent2.id, name: 'Event2 Standard', price: 25.00, quantity: 75 },
      ];

      for (const ticketTypeData of ticketTypesData) {
        const ticketType = ticketTypeRepository.create(ticketTypeData);
        await ticketTypeRepository.save(ticketType);
      }

      const event1TicketTypes = await ticketTypeRepository.find({
        where: { eventId: event1.id }
      });

      expect(event1TicketTypes).toHaveLength(2);
      event1TicketTypes.forEach(ticketType => {
        expect(ticketType.eventId).toBe(event1.id);
      });
    });

    it('should find ticket types by price range', async () => {
      const event = await createTestEvent();

      const ticketTypesData = [
        { name: 'Budget Ticket', price: 10.00, quantity: 200 },
        { name: 'Standard Ticket', price: 25.00, quantity: 150 },
        { name: 'Premium Ticket', price: 50.00, quantity: 50 },
      ];

      for (const ticketTypeData of ticketTypesData) {
        const ticketType = ticketTypeRepository.create({
          eventId: event.id,
          ...ticketTypeData,
        });
        await ticketTypeRepository.save(ticketType);
      }

      const midRangeTickets = await ticketTypeRepository
        .createQueryBuilder('ticketType')
        .where('ticketType.price >= :min AND ticketType.price <= :max', { min: 20, max: 40 })
        .getMany();

      expect(midRangeTickets).toHaveLength(1);
      expect(midRangeTickets[0].name).toBe('Standard Ticket');
    });

    it('should count total tickets available for an event', async () => {
      const event = await createTestEvent();

      const ticketTypesData = [
        { name: 'Type A', price: 15.00, quantity: 100 },
        { name: 'Type B', price: 20.00, quantity: 75 },
        { name: 'Type C', price: 30.00, quantity: 25 },
      ];

      for (const ticketTypeData of ticketTypesData) {
        const ticketType = ticketTypeRepository.create({
          eventId: event.id,
          ...ticketTypeData,
        });
        await ticketTypeRepository.save(ticketType);
      }

      const totalQuantity = await ticketTypeRepository
        .createQueryBuilder('ticketType')
        .select('SUM(ticketType.quantity)', 'total')
        .where('ticketType.eventId = :eventId', { eventId: event.id })
        .getRawOne();

      expect(parseInt(totalQuantity.total)).toBe(200);
    });

    it('should count total ticket types', async () => {
      const event = await createTestEvent();

      const ticketTypesData = [
        { name: 'Count Test 1', price: 10.00, quantity: 50 },
        { name: 'Count Test 2', price: 15.00, quantity: 75 },
        { name: 'Count Test 3', price: 20.00, quantity: 100 },
      ];

      for (const ticketTypeData of ticketTypesData) {
        const ticketType = ticketTypeRepository.create({
          eventId: event.id,
          ...ticketTypeData,
        });
        await ticketTypeRepository.save(ticketType);
      }

      const ticketTypeCount = await ticketTypeRepository.count();
      expect(ticketTypeCount).toBe(3);
    });
  });
});