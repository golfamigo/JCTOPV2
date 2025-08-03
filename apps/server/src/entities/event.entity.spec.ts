import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Venue } from './venue.entity';
import { getTestDatabaseConfig } from '../config/test-database.config';

describe('Event Entity', () => {
  let eventRepository: Repository<Event>;
  let userRepository: Repository<User>;
  let categoryRepository: Repository<Category>;
  let venueRepository: Repository<Venue>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getTestDatabaseConfig()),
        TypeOrmModule.forFeature([Event, User, Category, Venue]),
      ],
    }).compile();

    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
    venueRepository = module.get<Repository<Venue>>(getRepositoryToken(Venue));
  }, 30000);

  afterAll(async () => {
    await module.close();
  });

  afterEach(async () => {
    await eventRepository.clear();
    await userRepository.clear();
    await categoryRepository.clear();
    await venueRepository.clear();
  });

  describe('Entity Creation', () => {
    it('should create an event with valid data and relationships', async () => {
      // Create dependencies first
      const user = userRepository.create({
        name: 'John Organizer',
        email: 'john@example.com',
        authProvider: 'email',
      });
      const savedUser = await userRepository.save(user);

      const category = categoryRepository.create({
        name: 'Technology',
        description: 'Tech events',
        color: '#3b82f6',
      });
      const savedCategory = await categoryRepository.save(category);

      const venue = venueRepository.create({
        name: 'Convention Center',
        address: '123 Main St',
        city: 'New York',
        capacity: 1000,
      });
      const savedVenue = await venueRepository.save(venue);

      const eventData = {
        organizerId: savedUser.id,
        categoryId: savedCategory.id,
        venueId: savedVenue.id,
        title: 'Tech Conference 2024',
        description: 'Annual technology conference',
        startDate: new Date('2024-06-01T10:00:00Z'),
        endDate: new Date('2024-06-01T18:00:00Z'),
        location: 'Main Hall',
        status: 'published' as const,
      };

      const event = eventRepository.create(eventData);
      const savedEvent = await eventRepository.save(event);

      expect(savedEvent.id).toBeDefined();
      expect(savedEvent.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(savedEvent.organizerId).toBe(savedUser.id);
      expect(savedEvent.categoryId).toBe(savedCategory.id);
      expect(savedEvent.venueId).toBe(savedVenue.id);
      expect(savedEvent.title).toBe(eventData.title);
      expect(savedEvent.description).toBe(eventData.description);
      expect(savedEvent.startDate).toEqual(eventData.startDate);
      expect(savedEvent.endDate).toEqual(eventData.endDate);
      expect(savedEvent.location).toBe(eventData.location);
      expect(savedEvent.status).toBe(eventData.status);
      expect(savedEvent.createdAt).toBeInstanceOf(Date);
      expect(savedEvent.updatedAt).toBeInstanceOf(Date);
    });

    it('should create an event with default draft status', async () => {
      const user = userRepository.create({
        name: 'Jane Organizer',
        email: 'jane@example.com',
        authProvider: 'email',
      });
      const savedUser = await userRepository.save(user);

      const category = categoryRepository.create({
        name: 'Music',
        color: '#f59e0b',
      });
      const savedCategory = await categoryRepository.save(category);

      const venue = venueRepository.create({
        name: 'Music Hall',
        capacity: 500,
      });
      const savedVenue = await venueRepository.save(venue);

      const eventData = {
        organizerId: savedUser.id,
        categoryId: savedCategory.id,
        venueId: savedVenue.id,
        title: 'Music Festival',
        startDate: new Date('2024-07-01T14:00:00Z'),
        endDate: new Date('2024-07-01T22:00:00Z'),
      };

      const event = eventRepository.create(eventData);
      const savedEvent = await eventRepository.save(event);

      expect(savedEvent.status).toBe('draft');
    });

    it('should validate all status enum values', async () => {
      const user = userRepository.create({
        name: 'Test Organizer',
        email: 'test@example.com',
        authProvider: 'email',
      });
      const savedUser = await userRepository.save(user);

      const category = categoryRepository.create({
        name: 'Test Category',
        color: '#10b981',
      });
      const savedCategory = await categoryRepository.save(category);

      const venue = venueRepository.create({
        name: 'Test Venue',
        capacity: 100,
      });
      const savedVenue = await venueRepository.save(venue);

      const statusValues = ['draft', 'published', 'ended', 'paused'] as const;

      for (const status of statusValues) {
        const eventData = {
          organizerId: savedUser.id,
          categoryId: savedCategory.id,
          venueId: savedVenue.id,
          title: `Event ${status}`,
          startDate: new Date('2024-08-01T10:00:00Z'),
          endDate: new Date('2024-08-01T18:00:00Z'),
          status,
        };

        const event = eventRepository.create(eventData);
        const savedEvent = await eventRepository.save(event);

        expect(savedEvent.status).toBe(status);
      }
    });
  });

  describe('Entity Validation', () => {
    it('should fail to save event without required organizerId', async () => {
      const category = categoryRepository.create({
        name: 'Test Category',
        color: '#ef4444',
      });
      const savedCategory = await categoryRepository.save(category);

      const venue = venueRepository.create({
        name: 'Test Venue',
        capacity: 100,
      });
      const savedVenue = await venueRepository.save(venue);

      const invalidEventData = {
        categoryId: savedCategory.id,
        venueId: savedVenue.id,
        title: 'Event without organizer',
        startDate: new Date('2024-09-01T10:00:00Z'),
        endDate: new Date('2024-09-01T18:00:00Z'),
      };

      const event = eventRepository.create(invalidEventData);
      
      await expect(eventRepository.save(event)).rejects.toThrow();
    });

    it('should fail to save event without required title', async () => {
      const user = userRepository.create({
        name: 'Test User',
        email: 'test@example.com',
        authProvider: 'email',
      });
      const savedUser = await userRepository.save(user);

      const category = categoryRepository.create({
        name: 'Test Category',
        color: '#8b5cf6',
      });
      const savedCategory = await categoryRepository.save(category);

      const venue = venueRepository.create({
        name: 'Test Venue',
        capacity: 100,
      });
      const savedVenue = await venueRepository.save(venue);

      const invalidEventData = {
        organizerId: savedUser.id,
        categoryId: savedCategory.id,
        venueId: savedVenue.id,
        startDate: new Date('2024-10-01T10:00:00Z'),
        endDate: new Date('2024-10-01T18:00:00Z'),
      };

      const event = eventRepository.create(invalidEventData);
      
      await expect(eventRepository.save(event)).rejects.toThrow();
    });

    it('should fail to save event without required dates', async () => {
      const user = userRepository.create({
        name: 'Test User',
        email: 'test@example.com',
        authProvider: 'email',
      });
      const savedUser = await userRepository.save(user);

      const category = categoryRepository.create({
        name: 'Test Category',
        color: '#06b6d4',
      });
      const savedCategory = await categoryRepository.save(category);

      const venue = venueRepository.create({
        name: 'Test Venue',
        capacity: 100,
      });
      const savedVenue = await venueRepository.save(venue);

      const invalidEventData = {
        organizerId: savedUser.id,
        categoryId: savedCategory.id,
        venueId: savedVenue.id,
        title: 'Event without dates',
      };

      const event = eventRepository.create(invalidEventData);
      
      await expect(eventRepository.save(event)).rejects.toThrow();
    });
  });

  describe('Foreign Key Relationships', () => {
    it('should load event with related organizer, category, and venue', async () => {
      const user = userRepository.create({
        name: 'Organizer Name',
        email: 'organizer@example.com',
        authProvider: 'email',
      });
      const savedUser = await userRepository.save(user);

      const category = categoryRepository.create({
        name: 'Business',
        description: 'Business events',
        color: '#f59e0b',
      });
      const savedCategory = await categoryRepository.save(category);

      const venue = venueRepository.create({
        name: 'Business Center',
        address: '456 Business Ave',
        city: 'San Francisco',
        capacity: 200,
      });
      const savedVenue = await venueRepository.save(venue);

      const event = eventRepository.create({
        organizerId: savedUser.id,
        categoryId: savedCategory.id,
        venueId: savedVenue.id,
        title: 'Business Networking Event',
        startDate: new Date('2024-11-01T18:00:00Z'),
        endDate: new Date('2024-11-01T21:00:00Z'),
      });
      const savedEvent = await eventRepository.save(event);

      const eventWithRelations = await eventRepository.findOne({
        where: { id: savedEvent.id },
        relations: ['organizer', 'category', 'venue'],
      });

      expect(eventWithRelations).toBeDefined();
      expect(eventWithRelations!.organizer).toBeDefined();
      expect(eventWithRelations!.organizer.name).toBe('Organizer Name');
      expect(eventWithRelations!.category).toBeDefined();
      expect(eventWithRelations!.category.name).toBe('Business');
      expect(eventWithRelations!.venue).toBeDefined();
      expect(eventWithRelations!.venue.name).toBe('Business Center');
    });

    it('should fail to create event with non-existent organizer', async () => {
      const category = categoryRepository.create({
        name: 'Test Category',
        color: '#ef4444',
      });
      const savedCategory = await categoryRepository.save(category);

      const venue = venueRepository.create({
        name: 'Test Venue',
        capacity: 100,
      });
      const savedVenue = await venueRepository.save(venue);

      const invalidEventData = {
        organizerId: '00000000-0000-0000-0000-000000000000',
        categoryId: savedCategory.id,
        venueId: savedVenue.id,
        title: 'Event with invalid organizer',
        startDate: new Date('2024-12-01T10:00:00Z'),
        endDate: new Date('2024-12-01T18:00:00Z'),
      };

      const event = eventRepository.create(invalidEventData);
      
      await expect(eventRepository.save(event)).rejects.toThrow();
    });
  });

  describe('Database Constraints', () => {
    it('should update the updatedAt timestamp when modified', async () => {
      const user = userRepository.create({
        name: 'Test User',
        email: 'test@example.com',
        authProvider: 'email',
      });
      const savedUser = await userRepository.save(user);

      const category = categoryRepository.create({
        name: 'Test Category',
        color: '#10b981',
      });
      const savedCategory = await categoryRepository.save(category);

      const venue = venueRepository.create({
        name: 'Test Venue',
        capacity: 100,
      });
      const savedVenue = await venueRepository.save(venue);

      const event = eventRepository.create({
        organizerId: savedUser.id,
        categoryId: savedCategory.id,
        venueId: savedVenue.id,
        title: 'Original Title',
        startDate: new Date('2025-01-01T10:00:00Z'),
        endDate: new Date('2025-01-01T18:00:00Z'),
      });
      const savedEvent = await eventRepository.save(event);
      const originalUpdatedAt = savedEvent.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 1100));

      savedEvent.title = 'Updated Title';
      const updatedEvent = await eventRepository.save(savedEvent);

      expect(updatedEvent.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
      expect(updatedEvent.title).toBe('Updated Title');
    });
  });

  describe('TypeORM Repository Integration', () => {
    it('should find events by status', async () => {
      const user = userRepository.create({
        name: 'Test User',
        email: 'test@example.com',
        authProvider: 'email',
      });
      const savedUser = await userRepository.save(user);

      const category = categoryRepository.create({
        name: 'Test Category',
        color: '#8b5cf6',
      });
      const savedCategory = await categoryRepository.save(category);

      const venue = venueRepository.create({
        name: 'Test Venue',
        capacity: 100,
      });
      const savedVenue = await venueRepository.save(venue);

      const eventsData = [
        { title: 'Draft Event', status: 'draft' as const },
        { title: 'Published Event', status: 'published' as const },
        { title: 'Another Draft', status: 'draft' as const },
      ];

      for (const eventData of eventsData) {
        const event = eventRepository.create({
          organizerId: savedUser.id,
          categoryId: savedCategory.id,
          venueId: savedVenue.id,
          title: eventData.title,
          startDate: new Date('2025-02-01T10:00:00Z'),
          endDate: new Date('2025-02-01T18:00:00Z'),
          status: eventData.status,
        });
        await eventRepository.save(event);
      }

      const draftEvents = await eventRepository.find({
        where: { status: 'draft' }
      });

      expect(draftEvents).toHaveLength(2);
      draftEvents.forEach(event => {
        expect(event.status).toBe('draft');
      });
    });

    it('should find events by organizer', async () => {
      const user1 = userRepository.create({
        name: 'Organizer 1',
        email: 'org1@example.com',
        authProvider: 'email',
      });
      const savedUser1 = await userRepository.save(user1);

      const user2 = userRepository.create({
        name: 'Organizer 2',
        email: 'org2@example.com',
        authProvider: 'email',
      });
      const savedUser2 = await userRepository.save(user2);

      const category = categoryRepository.create({
        name: 'Test Category',
        color: '#ef4444',
      });
      const savedCategory = await categoryRepository.save(category);

      const venue = venueRepository.create({
        name: 'Test Venue',
        capacity: 100,
      });
      const savedVenue = await venueRepository.save(venue);

      const event1 = eventRepository.create({
        organizerId: savedUser1.id,
        categoryId: savedCategory.id,
        venueId: savedVenue.id,
        title: 'Event by Organizer 1',
        startDate: new Date('2025-03-01T10:00:00Z'),
        endDate: new Date('2025-03-01T18:00:00Z'),
      });
      await eventRepository.save(event1);

      const event2 = eventRepository.create({
        organizerId: savedUser2.id,
        categoryId: savedCategory.id,
        venueId: savedVenue.id,
        title: 'Event by Organizer 2',
        startDate: new Date('2025-04-01T10:00:00Z'),
        endDate: new Date('2025-04-01T18:00:00Z'),
      });
      await eventRepository.save(event2);

      const organizer1Events = await eventRepository.find({
        where: { organizerId: savedUser1.id }
      });

      expect(organizer1Events).toHaveLength(1);
      expect(organizer1Events[0].title).toBe('Event by Organizer 1');
    });
  });
});