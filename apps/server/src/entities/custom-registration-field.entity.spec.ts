import { CustomRegistrationField } from './custom-registration-field.entity';

describe('CustomRegistrationField Entity', () => {
  it('should create a custom registration field instance', () => {
    const field = new CustomRegistrationField();
    
    field.eventId = 'event-123';
    field.fieldName = 'full_name';
    field.fieldType = 'text';
    field.label = 'Full Name';
    field.placeholder = 'Enter your full name';
    field.required = true;
    field.order = 1;

    expect(field.eventId).toBe('event-123');
    expect(field.fieldName).toBe('full_name');
    expect(field.fieldType).toBe('text');
    expect(field.label).toBe('Full Name');
    expect(field.placeholder).toBe('Enter your full name');
    expect(field.required).toBe(true);
    expect(field.order).toBe(1);
  });

  it('should handle select field with options', () => {
    const field = new CustomRegistrationField();
    
    field.fieldType = 'select';
    field.options = ['Option 1', 'Option 2', 'Option 3'];

    expect(field.fieldType).toBe('select');
    expect(field.options).toEqual(['Option 1', 'Option 2', 'Option 3']);
  });

  it('should handle validation rules', () => {
    const field = new CustomRegistrationField();
    
    field.validationRules = {
      minLength: 2,
      maxLength: 50,
      pattern: '^[a-zA-Z ]+$'
    };

    expect(field.validationRules).toEqual({
      minLength: 2,
      maxLength: 50,
      pattern: '^[a-zA-Z ]+$'
    });
  });

  it('should have default values', () => {
    const field = new CustomRegistrationField();
    
    expect(field.required).toBe(false);
    expect(field.order).toBe(0);
  });
});