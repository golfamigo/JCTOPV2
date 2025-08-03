import { DiscountCode } from './discount-code.entity';

describe('DiscountCode Entity', () => {
  it('should create a discount code instance', () => {
    const discountCode = new DiscountCode();
    discountCode.id = 'test-id';
    discountCode.eventId = 'event-id';
    discountCode.code = 'SUMMER25';
    discountCode.type = 'percentage';
    discountCode.value = 25;
    discountCode.usageCount = 0;
    discountCode.expiresAt = new Date('2025-12-31');
    discountCode.createdAt = new Date();
    discountCode.updatedAt = new Date();

    expect(discountCode).toBeDefined();
    expect(discountCode.id).toBe('test-id');
    expect(discountCode.eventId).toBe('event-id');
    expect(discountCode.code).toBe('SUMMER25');
    expect(discountCode.type).toBe('percentage');
    expect(discountCode.value).toBe(25);
    expect(discountCode.usageCount).toBe(0);
    expect(discountCode.expiresAt).toEqual(new Date('2025-12-31'));
  });

  it('should handle null expiration date', () => {
    const discountCode = new DiscountCode();
    discountCode.expiresAt = null;

    expect(discountCode.expiresAt).toBeNull();
  });

  it('should handle fixed amount type', () => {
    const discountCode = new DiscountCode();
    discountCode.type = 'fixed_amount';
    discountCode.value = 10.99;

    expect(discountCode.type).toBe('fixed_amount');
    expect(discountCode.value).toBe(10.99);
  });
});