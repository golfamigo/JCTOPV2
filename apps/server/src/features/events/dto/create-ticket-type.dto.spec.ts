import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateTicketTypeDto } from './create-ticket-type.dto';

describe('CreateTicketTypeDto', () => {
  const validTicketTypeData = {
    name: 'General Admission',
    price: 49.99,
    quantity: 100,
  };

  it('should validate successfully with all required fields', async () => {
    const dto = plainToClass(CreateTicketTypeDto, validTicketTypeData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  describe('name validation', () => {
    it('should fail validation when name is empty', async () => {
      const dto = plainToClass(CreateTicketTypeDto, {
        ...validTicketTypeData,
        name: '',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when name is missing', async () => {
      const { name: _name, ...dataWithoutName } = validTicketTypeData;
      const dto = plainToClass(CreateTicketTypeDto, dataWithoutName);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation when name exceeds 255 characters', async () => {
      const longName = 'a'.repeat(256);
      const dto = plainToClass(CreateTicketTypeDto, {
        ...validTicketTypeData,
        name: longName,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should pass validation with name exactly 255 characters', async () => {
      const maxName = 'a'.repeat(255);
      const dto = plainToClass(CreateTicketTypeDto, {
        ...validTicketTypeData,
        name: maxName,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('price validation', () => {
    it('should fail validation when price is negative', async () => {
      const dto = plainToClass(CreateTicketTypeDto, {
        ...validTicketTypeData,
        price: -1,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('price');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should pass validation when price is zero', async () => {
      const dto = plainToClass(CreateTicketTypeDto, {
        ...validTicketTypeData,
        price: 0,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when price exceeds maximum', async () => {
      const dto = plainToClass(CreateTicketTypeDto, {
        ...validTicketTypeData,
        price: 1000000,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('price');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should pass validation with decimal price', async () => {
      const dto = plainToClass(CreateTicketTypeDto, {
        ...validTicketTypeData,
        price: 123.45,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when price is not a number', async () => {
      const dto = plainToClass(CreateTicketTypeDto, {
        ...validTicketTypeData,
        price: 'not-a-number',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('price');
    });

    it('should fail validation when price is missing', async () => {
      const { price: _price, ...dataWithoutPrice } = validTicketTypeData;
      const dto = plainToClass(CreateTicketTypeDto, dataWithoutPrice);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('price');
    });
  });

  describe('quantity validation', () => {
    it('should fail validation when quantity is zero', async () => {
      const dto = plainToClass(CreateTicketTypeDto, {
        ...validTicketTypeData,
        quantity: 0,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('quantity');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when quantity is negative', async () => {
      const dto = plainToClass(CreateTicketTypeDto, {
        ...validTicketTypeData,
        quantity: -10,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('quantity');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should pass validation with minimum quantity of 1', async () => {
      const dto = plainToClass(CreateTicketTypeDto, {
        ...validTicketTypeData,
        quantity: 1,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when quantity exceeds maximum', async () => {
      const dto = plainToClass(CreateTicketTypeDto, {
        ...validTicketTypeData,
        quantity: 1000000,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('quantity');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should fail validation when quantity is not a number', async () => {
      const dto = plainToClass(CreateTicketTypeDto, {
        ...validTicketTypeData,
        quantity: 'not-a-number',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('quantity');
    });

    it('should fail validation when quantity is missing', async () => {
      const { quantity: _quantity, ...dataWithoutQuantity } = validTicketTypeData;
      const dto = plainToClass(CreateTicketTypeDto, dataWithoutQuantity);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('quantity');
    });

    it('should fail validation with decimal quantity', async () => {
      const dto = plainToClass(CreateTicketTypeDto, {
        ...validTicketTypeData,
        quantity: 50.5,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('quantity');
    });
  });

  describe('edge cases', () => {
    it('should validate with multiple valid ticket type data sets', async () => {
      const ticketTypes = [
        { name: 'Early Bird', price: 29.99, quantity: 50 },
        { name: 'Regular', price: 39.99, quantity: 100 },
        { name: 'VIP', price: 99.99, quantity: 20 },
        { name: 'Free Entry', price: 0, quantity: 1000 },
      ];

      for (const ticketTypeData of ticketTypes) {
        const dto = plainToClass(CreateTicketTypeDto, ticketTypeData);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });
  });
});