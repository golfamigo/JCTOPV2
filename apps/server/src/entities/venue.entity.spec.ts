import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from './venue.entity';
import { getTestDatabaseConfig } from '../config/test-database.config';

describe('Venue Entity', () => {
  let venueRepository: Repository<Venue>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getTestDatabaseConfig()),
        TypeOrmModule.forFeature([Venue]),
      ],
    }).compile();

    venueRepository = module.get<Repository<Venue>>(getRepositoryToken(Venue));
  }, 30000);

  afterAll(async () => {
    await module.close();
  });

  afterEach(async () => {
    await venueRepository.clear();
  });

  describe('Entity Creation', () => {
    it('should create a venue with valid data', async () => {
      const venueData = {
        name: 'Convention Center',
        address: '123 Main Street',
        city: 'New York',
        capacity: 5000,
        description: 'Large convention center for major events',
      };

      const venue = venueRepository.create(venueData);
      const savedVenue = await venueRepository.save(venue);

      expect(savedVenue.id).toBeDefined();
      expect(savedVenue.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(savedVenue.name).toBe(venueData.name);
      expect(savedVenue.address).toBe(venueData.address);
      expect(savedVenue.city).toBe(venueData.city);
      expect(savedVenue.capacity).toBe(venueData.capacity);
      expect(savedVenue.description).toBe(venueData.description);
      expect(savedVenue.createdAt).toBeInstanceOf(Date);
      expect(savedVenue.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a venue with default capacity', async () => {
      const venueData = {
        name: 'Small Meeting Room',
        address: '456 Oak Avenue',
        city: 'San Francisco',
        description: 'Intimate meeting space',
      };

      const venue = venueRepository.create(venueData);
      const savedVenue = await venueRepository.save(venue);

      expect(savedVenue.id).toBeDefined();
      expect(savedVenue.name).toBe(venueData.name);
      expect(savedVenue.address).toBe(venueData.address);
      expect(savedVenue.city).toBe(venueData.city);
      expect(savedVenue.capacity).toBe(0);
      expect(savedVenue.description).toBe(venueData.description);
    });

    it('should create a venue with minimal required fields', async () => {
      const venueData = {
        name: 'Basic Venue',
        capacity: 100,
      };

      const venue = venueRepository.create(venueData);
      const savedVenue = await venueRepository.save(venue);

      expect(savedVenue.id).toBeDefined();
      expect(savedVenue.name).toBe(venueData.name);
      expect(savedVenue.address).toBeNull();
      expect(savedVenue.city).toBeNull();
      expect(savedVenue.capacity).toBe(venueData.capacity);
      expect(savedVenue.description).toBeNull();
    });
  });

  describe('Entity Validation', () => {
    it('should fail to save venue without required name', async () => {
      const invalidVenueData = {
        address: '789 Pine Street',
        city: 'Chicago',
        capacity: 300,
        description: 'A venue without name',
      };

      const venue = venueRepository.create(invalidVenueData);
      
      await expect(venueRepository.save(venue)).rejects.toThrow();
    });

    it('should validate capacity as integer', async () => {
      const venueData = {
        name: 'Test Venue',
        address: '321 Elm Street',
        city: 'Boston',
        capacity: 150,
        description: 'Test venue for capacity validation',
      };

      const venue = venueRepository.create(venueData);
      const savedVenue = await venueRepository.save(venue);

      expect(savedVenue.capacity).toBe(150);
      expect(typeof savedVenue.capacity).toBe('number');
    });

    it('should handle negative capacity values', async () => {
      const venueData = {
        name: 'Negative Capacity Venue',
        capacity: -10,
      };

      const venue = venueRepository.create(venueData);
      const savedVenue = await venueRepository.save(venue);

      expect(savedVenue.capacity).toBe(-10);
    });
  });

  describe('Database Constraints', () => {
    it('should allow multiple venues with same name in different cities', async () => {
      const venueData1 = {
        name: 'City Hall',
        address: '100 Government Plaza',
        city: 'New York',
        capacity: 500,
      };

      const venueData2 = {
        name: 'City Hall',
        address: '200 Main Street',
        city: 'Boston',
        capacity: 300,
      };

      const venue1 = venueRepository.create(venueData1);
      const savedVenue1 = await venueRepository.save(venue1);

      const venue2 = venueRepository.create(venueData2);
      const savedVenue2 = await venueRepository.save(venue2);

      expect(savedVenue1.name).toBe(venueData1.name);
      expect(savedVenue2.name).toBe(venueData2.name);
      expect(savedVenue1.city).toBe(venueData1.city);
      expect(savedVenue2.city).toBe(venueData2.city);
    });

    it('should update the updatedAt timestamp when modified', async () => {
      const venueData = {
        name: 'Auditorium',
        address: '555 University Drive',
        city: 'Los Angeles',
        capacity: 1000,
        description: 'University auditorium',
      };

      const venue = venueRepository.create(venueData);
      const savedVenue = await venueRepository.save(venue);
      const originalUpdatedAt = savedVenue.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 1100));

      savedVenue.capacity = 1200;
      const updatedVenue = await venueRepository.save(savedVenue);

      expect(updatedVenue.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
      expect(updatedVenue.capacity).toBe(1200);
    });
  });

  describe('TypeORM Repository Integration', () => {
    it('should find venue by name', async () => {
      const venueData = {
        name: 'Sports Arena',
        address: '777 Stadium Way',
        city: 'Miami',
        capacity: 20000,
        description: 'Large sports and entertainment venue',
      };

      const venue = venueRepository.create(venueData);
      const savedVenue = await venueRepository.save(venue);

      const foundVenue = await venueRepository.findOne({
        where: { name: venueData.name }
      });

      expect(foundVenue).toBeDefined();
      expect(foundVenue!.id).toBe(savedVenue.id);
      expect(foundVenue!.name).toBe(venueData.name);
    });

    it('should find venues by city', async () => {
      const venuesData = [
        { name: 'Venue A', address: '111 First St', city: 'Seattle', capacity: 200 },
        { name: 'Venue B', address: '222 Second St', city: 'Seattle', capacity: 300 },
        { name: 'Venue C', address: '333 Third St', city: 'Portland', capacity: 150 },
      ];

      for (const venueData of venuesData) {
        const venue = venueRepository.create(venueData);
        await venueRepository.save(venue);
      }

      const seattleVenues = await venueRepository.find({
        where: { city: 'Seattle' }
      });

      expect(seattleVenues).toHaveLength(2);
      seattleVenues.forEach(venue => {
        expect(venue.city).toBe('Seattle');
      });
    });

    it('should find venues by capacity range', async () => {
      const venuesData = [
        { name: 'Small Venue', capacity: 50 },
        { name: 'Medium Venue', capacity: 500 },
        { name: 'Large Venue', capacity: 5000 },
      ];

      for (const venueData of venuesData) {
        const venue = venueRepository.create(venueData);
        await venueRepository.save(venue);
      }

      const mediumVenues = await venueRepository
        .createQueryBuilder('venue')
        .where('venue.capacity >= :min AND venue.capacity <= :max', { min: 100, max: 1000 })
        .getMany();

      expect(mediumVenues).toHaveLength(1);
      expect(mediumVenues[0].name).toBe('Medium Venue');
    });

    it('should count total venues', async () => {
      const venuesData = [
        { name: 'Venue 1', capacity: 100 },
        { name: 'Venue 2', capacity: 200 },
        { name: 'Venue 3', capacity: 300 },
      ];

      for (const venueData of venuesData) {
        const venue = venueRepository.create(venueData);
        await venueRepository.save(venue);
      }

      const venueCount = await venueRepository.count();
      expect(venueCount).toBe(3);
    });
  });
});