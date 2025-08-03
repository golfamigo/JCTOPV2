import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { DiscountValidationDto } from './discount-validation.dto';

describe('DiscountValidationDto', () => {
  it('should validate a valid discount validation DTO', async () => {
    const validDto = {
      code: 'DISCOUNT10',
      totalAmount: 100,
    };

    const dto = plainToClass(DiscountValidationDto, validDto);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should validate with zero total amount', async () => {
    const validDto = {
      code: 'FREEDISCUNT',
      totalAmount: 0,
    };

    const dto = plainToClass(DiscountValidationDto, validDto);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail validation for missing code', async () => {
    const invalidDto = {
      totalAmount: 100,
    };

    const dto = plainToClass(DiscountValidationDto, invalidDto);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    
    const errorMessages = errors.map(error => Object.values(error.constraints || {})).flat();
    expect(errorMessages).toContain('code must be a string');
  });

  it('should fail validation for missing totalAmount', async () => {
    const invalidDto = {
      code: 'DISCOUNT10',
    };

    const dto = plainToClass(DiscountValidationDto, invalidDto);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    
    const errorMessages = errors.map(error => Object.values(error.constraints || {})).flat();
    expect(errorMessages).toContain('totalAmount must be a number conforming to the specified constraints');
  });

  it('should fail validation for empty code', async () => {
    const invalidDto = {
      code: '',
      totalAmount: 100,
    };

    const dto = plainToClass(DiscountValidationDto, invalidDto);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    
    const errorMessages = errors.map(error => Object.values(error.constraints || {})).flat();
    expect(errorMessages).toContain('code should not be empty');
  });

  it('should fail validation for non-string code', async () => {
    const invalidDto = {
      code: 123,
      totalAmount: 100,
    };

    const dto = plainToClass(DiscountValidationDto, invalidDto);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    
    const errorMessages = errors.map(error => Object.values(error.constraints || {})).flat();
    expect(errorMessages).toContain('code must be a string');
  });

  it('should fail validation for negative totalAmount', async () => {
    const invalidDto = {
      code: 'DISCOUNT10',
      totalAmount: -10,
    };

    const dto = plainToClass(DiscountValidationDto, invalidDto);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    
    const errorMessages = errors.map(error => Object.values(error.constraints || {})).flat();
    expect(errorMessages).toContain('totalAmount must not be less than 0');
  });

  it('should fail validation for non-number totalAmount', async () => {
    const invalidDto = {
      code: 'DISCOUNT10',
      totalAmount: 'not a number',
    };

    const dto = plainToClass(DiscountValidationDto, invalidDto);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    
    const errorMessages = errors.map(error => Object.values(error.constraints || {})).flat();
    expect(errorMessages).toContain('totalAmount must be a number conforming to the specified constraints');
  });

  it('should accept decimal total amounts', async () => {
    const validDto = {
      code: 'DISCOUNT15',
      totalAmount: 99.99,
    };

    const dto = plainToClass(DiscountValidationDto, validDto);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should accept large total amounts', async () => {
    const validDto = {
      code: 'BIGDISCOUNT',
      totalAmount: 9999.99,
    };

    const dto = plainToClass(DiscountValidationDto, validDto);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});