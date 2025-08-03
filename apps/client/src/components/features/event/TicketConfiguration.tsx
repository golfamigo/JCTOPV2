import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  HStack,
  FormErrorMessage,
  Heading,
  Text,
  IconButton,
  Divider,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { TicketType, CreateTicketTypeDto } from '@jctop-event/shared-types';

interface TicketConfigurationProps {
  ticketTypes: TicketType[];
  onChange: (ticketTypes: TicketType[]) => void;
  isReadOnly?: boolean;
}

interface TicketTypeFormData {
  id?: string;
  name: string;
  price: number;
  quantity: number;
}

interface TicketTypeErrors {
  name?: string;
  price?: string;
  quantity?: string;
}

const TicketConfiguration: React.FC<TicketConfigurationProps> = ({
  ticketTypes,
  onChange,
  isReadOnly = false,
}) => {
  const toast = useToast();
  const [formTicketTypes, setFormTicketTypes] = useState<TicketTypeFormData[]>(
    ticketTypes.length > 0 
      ? ticketTypes.map(tt => ({ ...tt }))
      : [{ name: '', price: 0, quantity: 1 }]
  );
  const [errors, setErrors] = useState<Record<number, TicketTypeErrors>>({});

  const validateTicketType = (ticketType: TicketTypeFormData, index: number): TicketTypeErrors => {
    const ticketErrors: TicketTypeErrors = {};

    if (!ticketType.name.trim()) {
      ticketErrors.name = 'Ticket name is required';
    } else if (ticketType.name.length > 255) {
      ticketErrors.name = 'Ticket name cannot exceed 255 characters';
    } else {
      // Check for duplicate names
      const duplicateIndex = formTicketTypes.findIndex(
        (tt, idx) => idx !== index && tt.name.trim().toLowerCase() === ticketType.name.trim().toLowerCase()
      );
      if (duplicateIndex !== -1) {
        ticketErrors.name = 'Ticket name must be unique';
      }
    }

    if (ticketType.price < 0) {
      ticketErrors.price = 'Price cannot be negative';
    } else if (ticketType.price > 999999.99) {
      ticketErrors.price = 'Price cannot exceed $999,999.99';
    }

    if (ticketType.quantity < 1) {
      ticketErrors.quantity = 'Quantity must be at least 1';
    } else if (ticketType.quantity > 999999) {
      ticketErrors.quantity = 'Quantity cannot exceed 999,999';
    } else if (!Number.isInteger(ticketType.quantity)) {
      ticketErrors.quantity = 'Quantity must be a whole number';
    }

    return ticketErrors;
  };

  const validateAllTicketTypes = (): boolean => {
    const newErrors: Record<number, TicketTypeErrors> = {};
    let hasErrors = false;

    formTicketTypes.forEach((ticketType, index) => {
      const ticketErrors = validateTicketType(ticketType, index);
      if (Object.keys(ticketErrors).length > 0) {
        newErrors[index] = ticketErrors;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleTicketTypeChange = (index: number, field: keyof TicketTypeFormData, value: string | number) => {
    const updatedTicketTypes = [...formTicketTypes];
    updatedTicketTypes[index] = { ...updatedTicketTypes[index], [field]: value };
    setFormTicketTypes(updatedTicketTypes);

    // Clear errors for this field
    if (errors[index]?.[field as keyof TicketTypeErrors]) {
      const updatedErrors = { ...errors };
      if (updatedErrors[index]) {
        delete updatedErrors[index][field as keyof TicketTypeErrors];
        if (Object.keys(updatedErrors[index]).length === 0) {
          delete updatedErrors[index];
        }
      }
      setErrors(updatedErrors);
    }

    // Update parent component
    if (validateAllTicketTypes()) {
      onChange(updatedTicketTypes as TicketType[]);
    }
  };

  const addTicketType = () => {
    if (formTicketTypes.length >= 10) {
      toast({
        title: 'Maximum ticket types reached',
        description: 'You can create up to 10 ticket types per event',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setFormTicketTypes([...formTicketTypes, { name: '', price: 0, quantity: 1 }]);
  };

  const removeTicketType = (index: number) => {
    if (formTicketTypes.length === 1) {
      toast({
        title: 'Cannot remove last ticket type',
        description: 'Events must have at least one ticket type',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const updatedTicketTypes = formTicketTypes.filter((_, i) => i !== index);
    setFormTicketTypes(updatedTicketTypes);

    // Remove errors for removed item and adjust indices
    const updatedErrors = { ...errors };
    delete updatedErrors[index];
    
    // Shift errors for items after removed index
    Object.keys(updatedErrors).forEach(key => {
      const keyNum = parseInt(key);
      if (keyNum > index) {
        updatedErrors[keyNum - 1] = updatedErrors[keyNum];
        delete updatedErrors[keyNum];
      }
    });
    
    setErrors(updatedErrors);
    onChange(updatedTicketTypes as TicketType[]);
  };

  const getTotalCapacity = (): number => {
    return formTicketTypes.reduce((total, tt) => total + (tt.quantity || 0), 0);
  };

  const getTotalRevenue = (): number => {
    return formTicketTypes.reduce((total, tt) => total + ((tt.price || 0) * (tt.quantity || 0)), 0);
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading as="h3" size="lg" mb={2} color="neutral.900">
            Ticket Configuration
          </Heading>
          <Text color="secondary.500" fontSize="sm">
            Set up different ticket types with pricing and quantities
          </Text>
        </Box>

        <VStack spacing={4} align="stretch">
          {formTicketTypes.map((ticketType, index) => (
            <Box key={index} borderWidth="1px" borderColor="neutral.200" borderRadius="md" p={4}>
              <HStack justify="space-between" mb={4}>
                <Heading as="h4" size="sm" color="neutral.700">
                  Ticket Type {index + 1}
                </Heading>
                {!isReadOnly && formTicketTypes.length > 1 && (
                  <IconButton
                    aria-label={`Remove ticket type ${index + 1}`}
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="error"
                    variant="ghost"
                    onClick={() => removeTicketType(index)}
                  />
                )}
              </HStack>

              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={!!errors[index]?.name} isReadOnly={isReadOnly}>
                  <FormLabel htmlFor={`ticket-name-${index}`}>Ticket Name</FormLabel>
                  <Input
                    id={`ticket-name-${index}`}
                    type="text"
                    value={ticketType.name}
                    onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                    placeholder="e.g., General Admission, VIP, Early Bird"
                    size="md"
                    aria-describedby={errors[index]?.name ? `ticket-name-error-${index}` : undefined}
                  />
                  <FormErrorMessage id={`ticket-name-error-${index}`}>
                    {errors[index]?.name}
                  </FormErrorMessage>
                </FormControl>

                <HStack spacing={4} align="flex-start">
                  <FormControl isRequired isInvalid={!!errors[index]?.price} flex={1} isReadOnly={isReadOnly}>
                    <FormLabel htmlFor={`ticket-price-${index}`}>Price ($)</FormLabel>
                    <NumberInput
                      value={ticketType.price}
                      onChange={(valueString, valueNumber) => 
                        handleTicketTypeChange(index, 'price', isNaN(valueNumber) ? 0 : valueNumber)
                      }
                      min={0}
                      max={999999.99}
                      precision={2}
                      step={0.01}
                      isReadOnly={isReadOnly}
                    >
                      <NumberInputField
                        id={`ticket-price-${index}`}
                        placeholder="0.00"
                        aria-describedby={errors[index]?.price ? `ticket-price-error-${index}` : undefined}
                      />
                      {!isReadOnly && (
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      )}
                    </NumberInput>
                    <FormErrorMessage id={`ticket-price-error-${index}`}>
                      {errors[index]?.price}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors[index]?.quantity} flex={1} isReadOnly={isReadOnly}>
                    <FormLabel htmlFor={`ticket-quantity-${index}`}>Quantity</FormLabel>
                    <NumberInput
                      value={ticketType.quantity}
                      onChange={(valueString, valueNumber) => 
                        handleTicketTypeChange(index, 'quantity', isNaN(valueNumber) ? 1 : Math.floor(valueNumber))
                      }
                      min={1}
                      max={999999}
                      step={1}
                      isReadOnly={isReadOnly}
                    >
                      <NumberInputField
                        id={`ticket-quantity-${index}`}
                        placeholder="1"
                        aria-describedby={errors[index]?.quantity ? `ticket-quantity-error-${index}` : undefined}
                      />
                      {!isReadOnly && (
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      )}
                    </NumberInput>
                    <FormErrorMessage id={`ticket-quantity-error-${index}`}>
                      {errors[index]?.quantity}
                    </FormErrorMessage>
                  </FormControl>
                </HStack>

                <Box bg="neutral.50" p={3} borderRadius="md">
                  <Text fontSize="sm" color="secondary.600">
                    <strong>Revenue for this ticket type:</strong> ${((ticketType.price || 0) * (ticketType.quantity || 0)).toFixed(2)}
                  </Text>
                </Box>
              </VStack>
            </Box>
          ))}
        </VStack>

        {!isReadOnly && (
          <Button
            leftIcon={<AddIcon />}
            onClick={addTicketType}
            colorScheme="primary"
            variant="outline"
            size="md"
            isDisabled={formTicketTypes.length >= 10}
            aria-label="Add new ticket type"
          >
            Add Another Ticket Type
          </Button>
        )}

        <Divider />

        <Box bg="primary.50" p={4} borderRadius="md">
          <VStack spacing={2} align="start">
            <Heading as="h4" size="sm" color="primary.700">
              Event Summary
            </Heading>
            <HStack justify="space-between" w="full">
              <Text color="primary.600" fontWeight="medium">
                Total Capacity:
              </Text>
              <Text color="primary.700" fontWeight="bold">
                {getTotalCapacity().toLocaleString()} tickets
              </Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text color="primary.600" fontWeight="medium">
                Potential Revenue:
              </Text>
              <Text color="primary.700" fontWeight="bold">
                ${getTotalRevenue().toFixed(2)}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {Object.keys(errors).length > 0 && (
          <Alert status="error">
            <AlertIcon />
            Please correct the errors in the ticket configuration above.
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default TicketConfiguration;