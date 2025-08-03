import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateTicketTypeDto } from './update-ticket-type.dto';

describe('UpdateTicketTypeDto', () => {
  it('should validate successfully with all optional fields', async () => {
    const dto = plainToClass(UpdateTicketTypeDto, {
      name: 'Updated Name',
      price: 59.99,
      quantity: 150,
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should validate successfully with empty object', async () => {
    const dto = plainToClass(UpdateTicketTypeDto, {});
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should validate successfully with only name', async () => {
    const dto = plainToClass(UpdateTicketTypeDto, {
      name: 'New Name',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should validate successfully with only price', async () => {
    const dto = plainToClass(UpdateTicketTypeDto, {
      price: 29.99,
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should validate successfully with only quantity', async () => {
    const dto = plainToClass(UpdateTicketTypeDto, {
      quantity: 200,
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  describe('name validation', () => {
    it('should fail validation when name is empty string', async () => {
      const dto = plainToClass(UpdateTicketTypeDto, {
        name: '',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when name exceeds 255 characters', async () => {
      const longName = 'a'.repeat(256);
      const dto = plainToClass(UpdateTicketTypeDto, {
        name: longName,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should pass validation with name exactly 255 characters', async () => {
      const maxName = 'a'.repeat(255);
      const dto = plainToClass(UpdateTicketTypeDto, {
        name: maxName,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('price validation', () => {
    it('should fail validation when price is negative', async () => {
      const dto = plainToClass(UpdateTicketTypeDto, {
        price: -1,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('price');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should pass validation when price is zero', async () => {
      const dto = plainToClass(UpdateTicketTypeDto, {
        price: 0,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when price exceeds maximum', async () => {
      const dto = plainToClass(UpdateTicketTypeDto, {
        price: 1000000,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('price');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should pass validation with decimal price', async () => {
      const dto = plainToClass(UpdateTicketTypeDto, {
        price: 999999.99,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('quantity validation', () => {
    it('should fail validation when quantity is zero', async () => {
      const dto = plainToClass(UpdateTicketTypeDto, {
        quantity: 0,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('quantity');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when quantity is negative', async () => {
      const dto = plainToClass(UpdateTicketTypeDto, {
        quantity: -10,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('quantity');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should pass validation with minimum quantity of 1', async () => {
      const dto = plainToClass(UpdateTicketTypeDto, {
        quantity: 1,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when quantity exceeds maximum', async () => {
      const dto = plainToClass(UpdateTicketTypeDto, {
        quantity: 1000000,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('quantity');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should pass validation with maximum valid quantity', async () => {
      const dto = plainToClass(UpdateTicketTypeDto, {
        quantity: 999999,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should validate with various partial updates', async () => {
      const partialUpdates = [
        { name: 'Updated Early Bird' },
        { price: 34.99 },
        { quantity: 75 },
        { name: 'VIP Package', price: 199.99 },
        { price: 0, quantity: 500 },
        { name: 'Standing Room', quantity: 25 },
      ];

      for (const updateData of partialUpdates) {
        const dto = plainToClass(UpdateTicketTypeDto, updateData);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should handle undefined values correctly', async () => {
      const dto = plainToClass(UpdateTicketTypeDto, {
        name: undefined,
        price: undefined,
        quantity: undefined,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});