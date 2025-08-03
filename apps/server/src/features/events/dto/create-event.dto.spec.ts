import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateEventDto } from './create-event.dto';

describe('CreateEventDto', () => {
  const validEventData = {
    title: 'Test Event',
    description: 'Test Description',
    startDate: '2024-12-01T10:00:00Z',
    endDate: '2024-12-01T18:00:00Z',
    location: 'Test Location',
    categoryId: '123e4567-e89b-12d3-a456-426614174000',
    venueId: '123e4567-e89b-12d3-a456-426614174001',
  };

  it('should validate successfully with all required fields', async () => {
    const dto = plainToClass(CreateEventDto, validEventData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should validate successfully without optional description', async () => {
    const { description: _description, ...dataWithoutDescription } = validEventData;
    const dto = plainToClass(CreateEventDto, dataWithoutDescription);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  describe('title validation', () => {
    it('should fail validation when title is empty', async () => {
      const dto = plainToClass(CreateEventDto, {
        ...validEventData,
        title: '',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when title is missing', async () => {
      const { title: _title, ...dataWithoutTitle } = validEventData;
      const dto = plainToClass(CreateEventDto, dataWithoutTitle);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
    });

    it('should fail validation when title exceeds 255 characters', async () => {
      const longTitle = 'a'.repeat(256);
      const dto = plainToClass(CreateEventDto, {
        ...validEventData,
        title: longTitle,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should pass validation with title exactly 255 characters', async () => {
      const maxTitle = 'a'.repeat(255);
      const dto = plainToClass(CreateEventDto, {
        ...validEventData,
        title: maxTitle,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('date validation', () => {
    it('should fail validation with invalid startDate format', async () => {
      const dto = plainToClass(CreateEventDto, {
        ...validEventData,
        startDate: 'invalid-date',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('startDate');
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });

    it('should fail validation with invalid endDate format', async () => {
      const dto = plainToClass(CreateEventDto, {
        ...validEventData,
        endDate: 'invalid-date',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('endDate');
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });

    it('should fail validation when startDate is missing', async () => {
      const { startDate: _startDate, ...dataWithoutStartDate } = validEventData;
      const dto = plainToClass(CreateEventDto, dataWithoutStartDate);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('startDate');
    });

    it('should fail validation when endDate is missing', async () => {
      const { endDate: _endDate, ...dataWithoutEndDate } = validEventData;
      const dto = plainToClass(CreateEventDto, dataWithoutEndDate);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('endDate');
    });
  });

  describe('location validation', () => {
    it('should fail validation when location is empty', async () => {
      const dto = plainToClass(CreateEventDto, {
        ...validEventData,
        location: '',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('location');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when location is missing', async () => {
      const { location: _location, ...dataWithoutLocation } = validEventData;
      const dto = plainToClass(CreateEventDto, dataWithoutLocation);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('location');
    });
  });

  describe('UUID validation', () => {
    it('should fail validation with invalid categoryId UUID', async () => {
      const dto = plainToClass(CreateEventDto, {
        ...validEventData,
        categoryId: 'invalid-uuid',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('categoryId');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail validation with invalid venueId UUID', async () => {
      const dto = plainToClass(CreateEventDto, {
        ...validEventData,
        venueId: 'invalid-uuid',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('venueId');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail validation when categoryId is missing', async () => {
      const { categoryId: _categoryId, ...dataWithoutCategoryId } = validEventData;
      const dto = plainToClass(CreateEventDto, dataWithoutCategoryId);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('categoryId');
    });

    it('should fail validation when venueId is missing', async () => {
      const { venueId: _venueId, ...dataWithoutVenueId } = validEventData;
      const dto = plainToClass(CreateEventDto, dataWithoutVenueId);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('venueId');
    });
  });

  describe('description validation', () => {
    it('should allow empty description', async () => {
      const dto = plainToClass(CreateEventDto, {
        ...validEventData,
        description: '',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should allow undefined description', async () => {
      const dto = plainToClass(CreateEventDto, {
        ...validEventData,
        description: undefined,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});