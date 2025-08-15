import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import { CustomRegistrationField } from '@jctop-event/shared-types';

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

const mockField: CustomRegistrationField = {
  id: 'field-1',
  eventId: 'event-1',
  fieldName: 'test_field',
  fieldType: 'text',
  label: 'Test Field',
  required: true,
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('DynamicFieldRenderer', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Text Field', () => {
    it('should render text input field', () => {
      renderWithChakra(
        <DynamicFieldRenderer
          field={mockField}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText(/test field/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should call onChange when text is entered', () => {
      renderWithChakra(
        <DynamicFieldRenderer
          field={mockField}
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test value' } });

      expect(mockOnChange).toHaveBeenCalledWith('test value');
    });

    it('should show placeholder text', () => {
      const fieldWithPlaceholder = { ...mockField, placeholder: 'Enter text here' };
      
      renderWithChakra(
        <DynamicFieldRenderer
          field={fieldWithPlaceholder}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
    });
  });

  describe('Email Field', () => {
    it('should render email input field', () => {
      const emailField = { ...mockField, fieldType: 'email' as const };
      
      renderWithChakra(
        <DynamicFieldRenderer
          field={emailField}
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });
  });

  describe('Select Field', () => {
    it('should render select field with options', () => {
      const selectField = {
        ...mockField,
        fieldType: 'select' as const,
        options: ['Option 1', 'Option 2', 'Option 3'],
      };
      
      renderWithChakra(
        <DynamicFieldRenderer
          field={selectField}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should call onChange when option is selected', () => {
      const selectField = {
        ...mockField,
        fieldType: 'select' as const,
        options: ['Option 1', 'Option 2'],
      };
      
      renderWithChakra(
        <DynamicFieldRenderer
          field={selectField}
          value=""
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'Option 1' } });

      expect(mockOnChange).toHaveBeenCalledWith('Option 1');
    });
  });

  describe('Checkbox Field', () => {
    it('should render checkbox field', () => {
      const checkboxField = { ...mockField, fieldType: 'checkbox' as const };
      
      renderWithChakra(
        <DynamicFieldRenderer
          field={checkboxField}
          value={false}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText('Test Field')).toBeInTheDocument();
    });

    it('should call onChange when checkbox is clicked', () => {
      const checkboxField = { ...mockField, fieldType: 'checkbox' as const };
      
      renderWithChakra(
        <DynamicFieldRenderer
          field={checkboxField}
          value={false}
          onChange={mockOnChange}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Textarea Field', () => {
    it('should render textarea field', () => {
      const textareaField = { ...mockField, fieldType: 'textarea' as const };
      
      renderWithChakra(
        <DynamicFieldRenderer
          field={textareaField}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Number Field', () => {
    it('should render number input field', () => {
      const numberField = { ...mockField, fieldType: 'number' as const };
      
      renderWithChakra(
        <DynamicFieldRenderer
          field={numberField}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message', () => {
      renderWithChakra(
        <DynamicFieldRenderer
          field={mockField}
          value=""
          onChange={mockOnChange}
          error="This field is required"
        />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should show required indicator for required fields', () => {
      renderWithChakra(
        <DynamicFieldRenderer
          field={mockField}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable field when isDisabled is true', () => {
      renderWithChakra(
        <DynamicFieldRenderer
          field={mockField}
          value=""
          onChange={mockOnChange}
          isDisabled={true}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });
  });
});