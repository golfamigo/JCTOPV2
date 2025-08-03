import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeatingZone } from './seating-zone.entity';
import { Event } from './event.entity';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Venue } from './venue.entity';
import { getTestDatabaseConfig } from '../config/test-database.config';

describe('SeatingZone Entity', () => {
  let seatingZoneRepository: Repository<SeatingZone>;
  let eventRepository: Repository<Event>;
  let userRepository: Repository<User>;
  let categoryRepository: Repository<Category>;
  let venueRepository: Repository<Venue>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getTestDatabaseConfig()),
        TypeOrmModule.forFeature([SeatingZone, Event, User, Category, Venue]),
      ],
    }).compile();

    seatingZoneRepository = module.get<Repository<SeatingZone>>(getRepositoryToken(SeatingZone));
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
    venueRepository = module.get<Repository<Venue>>(getRepositoryToken(Venue));
  }, 30000);

  afterAll(async () => {
    await module.close();
  });

  afterEach(async () => {
    await seatingZoneRepository.clear();
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
    it('should create a seating zone with valid data', async () => {
      const event = await createTestEvent();

      const seatingZoneData = {
        eventId: event.id,
        name: 'VIP Section',
        capacity: 50,
        description: 'Premium seating area with best views',
      };

      const seatingZone = seatingZoneRepository.create(seatingZoneData);
      const savedSeatingZone = await seatingZoneRepository.save(seatingZone);

      expect(savedSeatingZone.id).toBeDefined();
      expect(savedSeatingZone.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(savedSeatingZone.eventId).toBe(event.id);
      expect(savedSeatingZone.name).toBe(seatingZoneData.name);
      expect(savedSeatingZone.capacity).toBe(seatingZoneData.capacity);
      expect(savedSeatingZone.description).toBe(seatingZoneData.description);
      expect(savedSeatingZone.createdAt).toBeInstanceOf(Date);
      expect(savedSeatingZone.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a seating zone without description', async () => {
      const event = await createTestEvent();

      const seatingZoneData = {
        eventId: event.id,
        name: 'General Admission',
        capacity: 200,
      };

      const seatingZone = seatingZoneRepository.create(seatingZoneData);
      const savedSeatingZone = await seatingZoneRepository.save(seatingZone);

      expect(savedSeatingZone.id).toBeDefined();
      expect(savedSeatingZone.name).toBe(seatingZoneData.name);
      expect(savedSeatingZone.capacity).toBe(seatingZoneData.capacity);
      expect(savedSeatingZone.description).toBeNull();
    });

    it('should create multiple seating zones for the same event', async () => {
      const event = await createTestEvent();

      const seatingZonesData = [
        { name: 'Orchestra', capacity: 100, description: 'Main floor seating' },
        { name: 'Balcony', capacity: 75, description: 'Upper level seating' },
        { name: 'Standing Room', capacity: 50 },
      ];

      for (const seatingZoneData of seatingZonesData) {
        const seatingZone = seatingZoneRepository.create({
          eventId: event.id,
          ...seatingZoneData,
        });
        const savedSeatingZone = await seatingZoneRepository.save(seatingZone);

        expect(savedSeatingZone.name).toBe(seatingZoneData.name);
        expect(savedSeatingZone.capacity).toBe(seatingZoneData.capacity);
      }

      const allSeatingZones = await seatingZoneRepository.find({
        where: { eventId: event.id }
      });

      expect(allSeatingZones).toHaveLength(3);
    });
  });

  describe('Entity Validation', () => {
    it('should fail to save seating zone without required eventId', async () => {
      const invalidSeatingZoneData = {
        name: 'Invalid Zone',
        capacity: 100,
      };

      const seatingZone = seatingZoneRepository.create(invalidSeatingZoneData);
      
      await expect(seatingZoneRepository.save(seatingZone)).rejects.toThrow();
    });

    it('should fail to save seating zone without required name', async () => {
      const event = await createTestEvent();

      const invalidSeatingZoneData = {
        eventId: event.id,
        capacity: 75,
      };

      const seatingZone = seatingZoneRepository.create(invalidSeatingZoneData);
      
      await expect(seatingZoneRepository.save(seatingZone)).rejects.toThrow();
    });

    it('should fail to save seating zone without required capacity', async () => {
      const event = await createTestEvent();

      const invalidSeatingZoneData = {
        eventId: event.id,
        name: 'Missing Capacity Zone',
      };

      const seatingZone = seatingZoneRepository.create(invalidSeatingZoneData);
      
      await expect(seatingZoneRepository.save(seatingZone)).rejects.toThrow();
    });
  });

  describe('Foreign Key Relationships', () => {
    it('should load seating zone with related event', async () => {
      const event = await createTestEvent();

      const seatingZone = seatingZoneRepository.create({
        eventId: event.id,
        name: 'Main Hall',
        capacity: 300,
        description: 'Primary seating area',
      });
      const savedSeatingZone = await seatingZoneRepository.save(seatingZone);

      const seatingZoneWithEvent = await seatingZoneRepository.findOne({
        where: { id: savedSeatingZone.id },
        relations: ['event'],
      });

      expect(seatingZoneWithEvent).toBeDefined();
      expect(seatingZoneWithEvent!.event).toBeDefined();
      expect(seatingZoneWithEvent!.event.title).toBe('Test Event');
    });

    it('should fail to create seating zone with non-existent event', async () => {
      const invalidSeatingZoneData = {
        eventId: '00000000-0000-0000-0000-000000000000',
        name: 'Invalid Event Zone',
        capacity: 50,
      };

      const seatingZone = seatingZoneRepository.create(invalidSeatingZoneData);
      
      await expect(seatingZoneRepository.save(seatingZone)).rejects.toThrow();
    });

    it('should cascade delete when event is deleted', async () => {
      const event = await createTestEvent();

      const seatingZone = seatingZoneRepository.create({
        eventId: event.id,
        name: 'Cascade Test Zone',
        capacity: 100,
      });
      const savedSeatingZone = await seatingZoneRepository.save(seatingZone);

      // Verify seating zone exists
      const foundSeatingZone = await seatingZoneRepository.findOne({
        where: { id: savedSeatingZone.id }
      });
      expect(foundSeatingZone).toBeDefined();

      // Delete the event
      await eventRepository.remove(event);

      // Verify seating zone was cascade deleted
      const deletedSeatingZone = await seatingZoneRepository.findOne({
        where: { id: savedSeatingZone.id }
      });
      expect(deletedSeatingZone).toBeNull();
    });
  });

  describe('Database Constraints', () => {
    it('should update the updatedAt timestamp when modified', async () => {
      const event = await createTestEvent();

      const seatingZone = seatingZoneRepository.create({
        eventId: event.id,
        name: 'Update Test Zone',
        capacity: 150,
      });
      const savedSeatingZone = await seatingZoneRepository.save(seatingZone);
      const originalUpdatedAt = savedSeatingZone.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 1100));

      savedSeatingZone.capacity = 175;
      const updatedSeatingZone = await seatingZoneRepository.save(savedSeatingZone);

      expect(updatedSeatingZone.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
      expect(updatedSeatingZone.capacity).toBe(175);
    });

    it('should handle zero capacity zones', async () => {
      const event = await createTestEvent();

      const seatingZoneData = {
        eventId: event.id,
        name: 'Zero Capacity Test',
        capacity: 0,
      };

      const seatingZone = seatingZoneRepository.create(seatingZoneData);
      const savedSeatingZone = await seatingZoneRepository.save(seatingZone);

      expect(savedSeatingZone.capacity).toBe(0);
    });

    it('should handle large capacity values', async () => {
      const event = await createTestEvent();

      const seatingZoneData = {
        eventId: event.id,
        name: 'Stadium Section',
        capacity: 50000,
      };

      const seatingZone = seatingZoneRepository.create(seatingZoneData);
      const savedSeatingZone = await seatingZoneRepository.save(seatingZone);

      expect(savedSeatingZone.capacity).toBe(50000);
    });
  });

  describe('TypeORM Repository Integration', () => {
    it('should find seating zones by event', async () => {
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

      // Create seating zones for both events
      const seatingZonesData = [
        { eventId: event1.id, name: 'Event1 Zone A', capacity: 100 },
        { eventId: event1.id, name: 'Event1 Zone B', capacity: 150 },
        { eventId: savedEvent2.id, name: 'Event2 Main Zone', capacity: 200 },
      ];

      for (const seatingZoneData of seatingZonesData) {
        const seatingZone = seatingZoneRepository.create(seatingZoneData);
        await seatingZoneRepository.save(seatingZone);
      }

      const event1SeatingZones = await seatingZoneRepository.find({
        where: { eventId: event1.id }
      });

      expect(event1SeatingZones).toHaveLength(2);
      event1SeatingZones.forEach(seatingZone => {
        expect(seatingZone.eventId).toBe(event1.id);
      });
    });

    it('should calculate total seating capacity for an event', async () => {
      const event = await createTestEvent();

      const seatingZonesData = [
        { name: 'Section A', capacity: 100 },
        { name: 'Section B', capacity: 150 },
        { name: 'Section C', capacity: 75 },
      ];

      for (const seatingZoneData of seatingZonesData) {
        const seatingZone = seatingZoneRepository.create({
          eventId: event.id,
          ...seatingZoneData,
        });
        await seatingZoneRepository.save(seatingZone);
      }

      const totalCapacity = await seatingZoneRepository
        .createQueryBuilder('seatingZone')
        .select('SUM(seatingZone.capacity)', 'total')
        .where('seatingZone.eventId = :eventId', { eventId: event.id })
        .getRawOne();

      expect(parseInt(totalCapacity.total)).toBe(325);
    });

    it('should find seating zones by name pattern', async () => {
      const event = await createTestEvent();

      const seatingZonesData = [
        { name: 'VIP Lounge', capacity: 30 },
        { name: 'VIP Box', capacity: 20 },
        { name: 'General Area', capacity: 200 },
      ];

      for (const seatingZoneData of seatingZonesData) {
        const seatingZone = seatingZoneRepository.create({
          eventId: event.id,
          ...seatingZoneData,
        });
        await seatingZoneRepository.save(seatingZone);
      }

      const vipZones = await seatingZoneRepository
        .createQueryBuilder('seatingZone')
        .where('seatingZone.name LIKE :pattern', { pattern: 'VIP%' })
        .getMany();

      expect(vipZones).toHaveLength(2);
      vipZones.forEach(zone => {
        expect(zone.name).toMatch(/^VIP/);
      });
    });

    it('should count total seating zones', async () => {
      const event = await createTestEvent();

      const seatingZonesData = [
        { name: 'Zone 1', capacity: 50 },
        { name: 'Zone 2', capacity: 75 },
        { name: 'Zone 3', capacity: 100 },
      ];

      for (const seatingZoneData of seatingZonesData) {
        const seatingZone = seatingZoneRepository.create({
          eventId: event.id,
          ...seatingZoneData,
        });
        await seatingZoneRepository.save(seatingZone);
      }

      const seatingZoneCount = await seatingZoneRepository.count();
      expect(seatingZoneCount).toBe(3);
    });
  });
});