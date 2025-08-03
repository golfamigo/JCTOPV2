import { validate } from 'class-validator';
import { UpdateEventStatusDto } from './update-event-status.dto';

describe('UpdateEventStatusDto', () => {
  it('should validate with valid status', async () => {
    const dto = new UpdateEventStatusDto();
    dto.status = 'published';
    dto.reason = 'Event is ready';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate all valid status values', async () => {
    const validStatuses: Array<'draft' | 'published' | 'unpublished' | 'paused' | 'ended'> = [
      'draft', 'published', 'unpublished', 'paused', 'ended'
    ];

    for (const status of validStatuses) {
      const dto = new UpdateEventStatusDto();
      dto.status = status;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    }
  });

  it('should fail validation with invalid status', async () => {
    const dto = new UpdateEventStatusDto();
    (dto as any).status = 'invalid-status';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isEnum).toContain('Status must be one of: draft, published, unpublished, paused, ended');
  });

  it('should validate without optional reason', async () => {
    const dto = new UpdateEventStatusDto();
    dto.status = 'draft';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when status is missing', async () => {
    const dto = new UpdateEventStatusDto();
    // Not setting status

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('status');
  });
});