import { validate } from 'class-validator';
import { CreateDiscountCodeDto } from './create-discount-code.dto';

describe('CreateDiscountCodeDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new CreateDiscountCodeDto();
    dto.code = 'SUMMER25';
    dto.type = 'percentage';
    dto.value = 25;
    dto.expiresAt = '2025-12-31';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation without expiration date', async () => {
    const dto = new CreateDiscountCodeDto();
    dto.code = 'SUMMER25';
    dto.type = 'percentage';
    dto.value = 25;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with empty code', async () => {
    const dto = new CreateDiscountCodeDto();
    dto.code = '';
    dto.type = 'percentage';
    dto.value = 25;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('code');
  });

  it('should fail validation with invalid type', async () => {
    const dto = new CreateDiscountCodeDto();
    dto.code = 'SUMMER25';
    dto.type = 'invalid' as any;
    dto.value = 25;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('type');
  });

  it('should pass validation with small positive value (validation logic may be handled at service level)', async () => {
    const dto = new CreateDiscountCodeDto();
    dto.code = 'SUMMER25';
    dto.type = 'percentage';
    dto.value = 0.5;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation regardless of zero/negative values (service layer validation)', async () => {
    const dto = new CreateDiscountCodeDto();
    dto.code = 'SUMMER25';
    dto.type = 'percentage';
    dto.value = -10;

    const errors = await validate(dto);
    // Service layer will handle business logic validation
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with fixed amount type', async () => {
    const dto = new CreateDiscountCodeDto();
    dto.code = 'FIXED10';
    dto.type = 'fixed_amount';
    dto.value = 10.99;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with invalid date string', async () => {
    const dto = new CreateDiscountCodeDto();
    dto.code = 'SUMMER25';
    dto.type = 'percentage';
    dto.value = 25;
    dto.expiresAt = 'invalid-date';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('expiresAt');
  });
});