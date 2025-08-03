import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateSeatingZoneDto } from './create-seating-zone.dto';

describe('CreateSeatingZoneDto', () => {
  const validSeatingZoneData = {
    name: 'VIP Section',
    capacity: 50,
    description: 'Premium seating area with best views',
  };

  it('should validate successfully with all fields', async () => {
    const dto = plainToClass(CreateSeatingZoneDto, validSeatingZoneData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should validate successfully without optional description', async () => {
    const { description: _description, ...dataWithoutDescription } = validSeatingZoneData;
    const dto = plainToClass(CreateSeatingZoneDto, dataWithoutDescription);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  describe('name validation', () => {
    it('should fail validation when name is empty', async () => {
      const dto = plainToClass(CreateSeatingZoneDto, {
        ...validSeatingZoneData,
        name: '',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when name is missing', async () => {
      const { name: _name, ...dataWithoutName } = validSeatingZoneData;
      const dto = plainToClass(CreateSeatingZoneDto, dataWithoutName);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation when name exceeds 255 characters', async () => {
      const longName = 'a'.repeat(256);
      const dto = plainToClass(CreateSeatingZoneDto, {
        ...validSeatingZoneData,
        name: longName,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should pass validation with name exactly 255 characters', async () => {
      const maxName = 'a'.repeat(255);
      const dto = plainToClass(CreateSeatingZoneDto, {
        ...validSeatingZoneData,
        name: maxName,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('capacity validation', () => {
    it('should fail validation when capacity is zero', async () => {
      const dto = plainToClass(CreateSeatingZoneDto, {
        ...validSeatingZoneData,
        capacity: 0,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('capacity');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when capacity is negative', async () => {
      const dto = plainToClass(CreateSeatingZoneDto, {
        ...validSeatingZoneData,
        capacity: -10,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('capacity');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should pass validation with minimum capacity of 1', async () => {
      const dto = plainToClass(CreateSeatingZoneDto, {
        ...validSeatingZoneData,
        capacity: 1,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when capacity exceeds maximum', async () => {
      const dto = plainToClass(CreateSeatingZoneDto, {
        ...validSeatingZoneData,
        capacity: 1000000,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('capacity');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should pass validation with maximum valid capacity', async () => {
      const dto = plainToClass(CreateSeatingZoneDto, {
        ...validSeatingZoneData,
        capacity: 999999,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when capacity is not a number', async () => {
      const dto = plainToClass(CreateSeatingZoneDto, {
        ...validSeatingZoneData,
        capacity: 'not-a-number',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('capacity');
    });

    it('should fail validation when capacity is missing', async () => {
      const { capacity: _capacity, ...dataWithoutCapacity } = validSeatingZoneData;
      const dto = plainToClass(CreateSeatingZoneDto, dataWithoutCapacity);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('capacity');
    });

    it('should fail validation with decimal capacity', async () => {
      const dto = plainToClass(CreateSeatingZoneDto, {
        ...validSeatingZoneData,
        capacity: 50.5,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('capacity');
    });
  });

  describe('description validation', () => {
    it('should allow empty description', async () => {
      const dto = plainToClass(CreateSeatingZoneDto, {
        ...validSeatingZoneData,
        description: '',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should allow undefined description', async () => {
      const dto = plainToClass(CreateSeatingZoneDto, {
        ...validSeatingZoneData,
        description: undefined,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should allow long description text', async () => {
      const longDescription = 'This is a very long description. '.repeat(100);
      const dto = plainToClass(CreateSeatingZoneDto, {
        ...validSeatingZoneData,
        description: longDescription,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should validate with multiple valid seating zone data sets', async () => {
      const seatingZones = [
        { name: 'Orchestra', capacity: 100, description: 'Main floor seating' },
        { name: 'Balcony', capacity: 75, description: 'Upper level seating' },
        { name: 'Standing Room', capacity: 50 },
        { name: 'VIP Box', capacity: 8, description: 'Private box with premium service' },
        { name: 'Stadium Section A', capacity: 50000 },
      ];

      for (const seatingZoneData of seatingZones) {
        const dto = plainToClass(CreateSeatingZoneDto, seatingZoneData);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });
  });
});