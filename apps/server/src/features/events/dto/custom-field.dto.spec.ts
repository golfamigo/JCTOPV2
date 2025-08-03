import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateCustomFieldDto, UpdateCustomFieldDto, ValidationRulesDto } from './custom-field.dto';

describe('Custom Field DTOs', () => {
  describe('CreateCustomFieldDto', () => {
    it('should validate a valid create custom field DTO', async () => {
      const validDto = {
        fieldName: 'full_name',
        fieldType: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
        order: 1,
      };

      const dto = plainToClass(CreateCustomFieldDto, validDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate a select field with options', async () => {
      const validDto = {
        fieldName: 'country',
        fieldType: 'select',
        label: 'Country',
        required: true,
        options: ['USA', 'Canada', 'UK'],
        order: 1,
      };

      const dto = plainToClass(CreateCustomFieldDto, validDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate a field with validation rules', async () => {
      const validDto = {
        fieldName: 'phone',
        fieldType: 'text',
        label: 'Phone Number',
        required: true,
        validationRules: {
          minLength: 10,
          maxLength: 15,
          pattern: '^[0-9+\\-\\s()]+$',
        },
        order: 1,
      };

      const dto = plainToClass(CreateCustomFieldDto, validDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation for missing required fields', async () => {
      const invalidDto = {
        fieldName: 'test',
        // Missing fieldType, label, required, order
      };

      const dto = plainToClass(CreateCustomFieldDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      
      const errorMessages = errors.map(error => Object.values(error.constraints || {})).flat();
      expect(errorMessages).toContain('fieldType must be one of the following values: text, email, number, select, checkbox, textarea');
      expect(errorMessages).toContain('label should not be empty');
      expect(errorMessages).toContain('required must be a boolean value');
      expect(errorMessages).toContain('order must be a number conforming to the specified constraints');
    });

    it('should fail validation for invalid field type', async () => {
      const invalidDto = {
        fieldName: 'test',
        fieldType: 'invalid',
        label: 'Test',
        required: true,
        order: 1,
      };

      const dto = plainToClass(CreateCustomFieldDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      
      const errorMessages = errors.map(error => Object.values(error.constraints || {})).flat();
      expect(errorMessages).toContain('fieldType must be one of the following values: text, email, number, select, checkbox, textarea');
    });

    it('should fail validation for invalid options array', async () => {
      const invalidDto = {
        fieldName: 'test',
        fieldType: 'select',
        label: 'Test',
        required: true,
        options: ['valid', 123], // Invalid: number in string array
        order: 1,
      };

      const dto = plainToClass(CreateCustomFieldDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UpdateCustomFieldDto', () => {
    it('should validate a valid update custom field DTO', async () => {
      const validDto = {
        label: 'Updated Label',
        required: false,
        order: 2,
      };

      const dto = plainToClass(UpdateCustomFieldDto, validDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate an empty update DTO', async () => {
      const dto = plainToClass(UpdateCustomFieldDto, {});
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation for invalid field type in update', async () => {
      const invalidDto = {
        fieldType: 'invalid',
      };

      const dto = plainToClass(UpdateCustomFieldDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      
      const errorMessages = errors.map(error => Object.values(error.constraints || {})).flat();
      expect(errorMessages).toContain('fieldType must be one of the following values: text, email, number, select, checkbox, textarea');
    });
  });

  describe('ValidationRulesDto', () => {
    it('should validate valid validation rules', async () => {
      const validRules = {
        minLength: 5,
        maxLength: 100,
        pattern: '^[a-zA-Z ]+$',
      };

      const dto = plainToClass(ValidationRulesDto, validRules);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate partial validation rules', async () => {
      const validRules = {
        minLength: 2,
      };

      const dto = plainToClass(ValidationRulesDto, validRules);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation for invalid minLength', async () => {
      const invalidRules = {
        minLength: 'not a number',
      };

      const dto = plainToClass(ValidationRulesDto, invalidRules);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for invalid pattern', async () => {
      const invalidRules = {
        pattern: 123,
      };

      const dto = plainToClass(ValidationRulesDto, invalidRules);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });
});