import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  VStack,
  FormErrorMessage,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { CreateDiscountCodeDto, UpdateDiscountCodeDto, DiscountCodeResponse } from '@jctop-event/shared-types';

interface DiscountCodeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDiscountCodeDto | UpdateDiscountCodeDto) => Promise<void>;
  initialData?: DiscountCodeResponse;
  isLoading?: boolean;
}

interface FormData {
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  expiresAt: string;
}

interface FormErrors {
  code?: string;
  type?: string;
  value?: string;
  expiresAt?: string;
}

const DiscountCodeForm: React.FC<DiscountCodeFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const toast = useToast();
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState<FormData>({
    code: initialData?.code || '',
    type: initialData?.type || 'percentage',
    value: initialData?.value || 0,
    expiresAt: initialData?.expiresAt 
      ? new Date(initialData.expiresAt).toISOString().slice(0, 16)
      : '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Discount code is required';
    } else if (formData.code.length < 2) {
      newErrors.code = 'Discount code must be at least 2 characters';
    }

    if (!formData.type) {
      newErrors.type = 'Discount type is required';
    }

    if (formData.value <= 0) {
      newErrors.value = 'Value must be greater than 0';
    } else if (formData.type === 'percentage' && formData.value > 100) {
      newErrors.value = 'Percentage cannot exceed 100%';
    }

    if (formData.expiresAt) {
      const expiresDate = new Date(formData.expiresAt);
      if (expiresDate <= new Date()) {
        newErrors.expiresAt = 'Expiration date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Sanitize and format the code for security and consistency
      const sanitizedCode = formData.code
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, ''); // Remove any non-alphanumeric characters

      const submitData = {
        code: sanitizedCode,
        type: formData.type,
        value: Number(formData.value), // Ensure proper number formatting
        expiresAt: formData.expiresAt || undefined,
      };

      await onSubmit(submitData);
      handleClose();
      
      toast({
        title: `Discount code ${isEditing ? 'updated' : 'created'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: `Failed to ${isEditing ? 'update' : 'create'} discount code`,
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      expiresAt: '',
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {isEditing ? 'Edit Discount Code' : 'Create Discount Code'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.code} isRequired>
                <FormLabel>Discount Code</FormLabel>
                <Input
                  placeholder="Enter discount code (e.g., SUMMER25)"
                  value={formData.code}
                  onChange={(e) => {
                    // Auto-format: uppercase and alphanumeric only
                    const formatted = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    handleInputChange('code', formatted);
                  }}
                  maxLength={50}
                  pattern="[A-Z0-9]+"
                  title="Code can only contain uppercase letters and numbers"
                />
                <FormErrorMessage>{errors.code}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.type} isRequired>
                <FormLabel>Discount Type</FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as 'percentage' | 'fixed_amount')}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount ($)</option>
                </Select>
                <FormErrorMessage>{errors.type}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.value} isRequired>
                <FormLabel>
                  {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                </FormLabel>
                <NumberInput
                  value={formData.value}
                  onChange={(_, value) => handleInputChange('value', value)}
                  min={0.01}
                  max={formData.type === 'percentage' ? 100 : 999999.99}
                  step={formData.type === 'percentage' ? 1 : 0.01}
                  precision={formData.type === 'percentage' ? 0 : 2}
                >
                  <NumberInputField placeholder={`Enter ${formData.type === 'percentage' ? 'percentage' : 'amount'}`} />
                </NumberInput>
                <FormErrorMessage>{errors.value}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.expiresAt}>
                <FormLabel>Expiration Date (Optional)</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                />
                <FormErrorMessage>{errors.expiresAt}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isLoading}
              loadingText={isEditing ? 'Updating...' : 'Creating...'}
            >
              {isEditing ? 'Update' : 'Create'} Discount Code
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default DiscountCodeForm;