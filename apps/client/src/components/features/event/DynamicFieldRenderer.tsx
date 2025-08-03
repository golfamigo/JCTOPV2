import React from 'react';
import {
  Input,
  Textarea,
  Select,
  Checkbox,
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useColorModeValue,
} from '@chakra-ui/react';
import { CustomRegistrationField } from '@jctop-event/shared-types';

interface DynamicFieldRendererProps {
  field: CustomRegistrationField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  isDisabled?: boolean;
}

const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  isDisabled = false,
}) => {
  // Design system colors following branding guide
  const borderColor = useColorModeValue('#E2E8F0', '#475569');
  const errorColor = '#EF4444';
  const focusColor = '#2563EB';
  const neutralMedium = '#64748B';

  const renderField = () => {
    switch (field.fieldType) {
      case 'text':
        return (
          <Input
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            isInvalid={!!error}
            isDisabled={isDisabled}
            borderColor={borderColor}
            focusBorderColor={focusColor}
            _placeholder={{ color: neutralMedium }}
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            isInvalid={!!error}
            isDisabled={isDisabled}
            borderColor={borderColor}
            focusBorderColor={focusColor}
            _placeholder={{ color: neutralMedium }}
          />
        );

      case 'number':
        return (
          <NumberInput
            value={value || ''}
            onChange={(valueString) => onChange(valueString)}
            isInvalid={!!error}
            isDisabled={isDisabled}
          >
            <NumberInputField
              placeholder={field.placeholder}
              borderColor={borderColor}
              focusBorderColor={focusColor}
              _placeholder={{ color: neutralMedium }}
            />
          </NumberInput>
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            isInvalid={!!error}
            isDisabled={isDisabled}
            borderColor={borderColor}
            focusBorderColor={focusColor}
            _placeholder={{ color: neutralMedium }}
            resize="vertical"
            minH="100px"
          />
        );

      case 'select':
        return (
          <Select
            placeholder={field.placeholder || 'Select an option'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            isInvalid={!!error}
            isDisabled={isDisabled}
            borderColor={borderColor}
            focusBorderColor={focusColor}
            _placeholder={{ color: neutralMedium }}
          >
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        );

      case 'checkbox':
        return (
          <Checkbox
            isChecked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            isInvalid={!!error}
            isDisabled={isDisabled}
            colorScheme="blue"
            size="md"
          >
            {field.label}
          </Checkbox>
        );

      default:
        return null;
    }
  };

  return (
    <FormControl isInvalid={!!error} isRequired={field.required}>
      {field.fieldType !== 'checkbox' && (
        <FormLabel 
          htmlFor={field.id}
          color={neutralMedium}
          fontWeight="semibold"
          fontSize="sm"
        >
          {field.label}
          {field.required && (
            <span style={{ color: errorColor, marginLeft: '4px' }}>*</span>
          )}
        </FormLabel>
      )}
      
      {renderField()}
      
      {error && (
        <FormErrorMessage color={errorColor} fontSize="sm">
          {error}
        </FormErrorMessage>
      )}
    </FormControl>
  );
};

export default DynamicFieldRenderer;