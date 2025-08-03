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
  Textarea,
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
  Progress,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { SeatingZone, CreateSeatingZoneDto } from '@jctop-event/shared-types';

interface SeatingConfigurationProps {
  seatingZones: SeatingZone[];
  onChange: (seatingZones: SeatingZone[]) => void;
  venueCapacity?: number;
  isReadOnly?: boolean;
}

interface SeatingZoneFormData {
  id?: string;
  name: string;
  capacity: number;
  description?: string;
}

interface SeatingZoneErrors {
  name?: string;
  capacity?: string;
  description?: string;
}

const SeatingConfiguration: React.FC<SeatingConfigurationProps> = ({
  seatingZones,
  onChange,
  venueCapacity,
  isReadOnly = false,
}) => {
  const toast = useToast();
  const [formSeatingZones, setFormSeatingZones] = useState<SeatingZoneFormData[]>(
    seatingZones.length > 0 
      ? seatingZones.map(sz => ({ ...sz }))
      : [{ name: '', capacity: 1, description: '' }]
  );
  const [errors, setErrors] = useState<Record<number, SeatingZoneErrors>>({});

  const validateSeatingZone = (seatingZone: SeatingZoneFormData, index: number): SeatingZoneErrors => {
    const zoneErrors: SeatingZoneErrors = {};

    if (!seatingZone.name.trim()) {
      zoneErrors.name = 'Zone name is required';
    } else if (seatingZone.name.length > 255) {
      zoneErrors.name = 'Zone name cannot exceed 255 characters';
    } else {
      // Check for duplicate names
      const duplicateIndex = formSeatingZones.findIndex(
        (sz, idx) => idx !== index && sz.name.trim().toLowerCase() === seatingZone.name.trim().toLowerCase()
      );
      if (duplicateIndex !== -1) {
        zoneErrors.name = 'Zone name must be unique';
      }
    }

    if (seatingZone.capacity < 1) {
      zoneErrors.capacity = 'Capacity must be at least 1';
    } else if (seatingZone.capacity > 999999) {
      zoneErrors.capacity = 'Capacity cannot exceed 999,999';
    } else if (!Number.isInteger(seatingZone.capacity)) {
      zoneErrors.capacity = 'Capacity must be a whole number';
    }

    return zoneErrors;
  };

  const validateAllSeatingZones = (): boolean => {
    const newErrors: Record<number, SeatingZoneErrors> = {};
    let hasErrors = false;

    formSeatingZones.forEach((seatingZone, index) => {
      const zoneErrors = validateSeatingZone(seatingZone, index);
      if (Object.keys(zoneErrors).length > 0) {
        newErrors[index] = zoneErrors;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSeatingZoneChange = (index: number, field: keyof SeatingZoneFormData, value: string | number) => {
    const updatedSeatingZones = [...formSeatingZones];
    updatedSeatingZones[index] = { ...updatedSeatingZones[index], [field]: value };
    setFormSeatingZones(updatedSeatingZones);

    // Clear errors for this field
    if (errors[index]?.[field as keyof SeatingZoneErrors]) {
      const updatedErrors = { ...errors };
      if (updatedErrors[index]) {
        delete updatedErrors[index][field as keyof SeatingZoneErrors];
        if (Object.keys(updatedErrors[index]).length === 0) {
          delete updatedErrors[index];
        }
      }
      setErrors(updatedErrors);
    }

    // Update parent component
    if (validateAllSeatingZones()) {
      onChange(updatedSeatingZones as SeatingZone[]);
    }
  };

  const addSeatingZone = () => {
    if (formSeatingZones.length >= 20) {
      toast({
        title: 'Maximum seating zones reached',
        description: 'You can create up to 20 seating zones per event',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setFormSeatingZones([...formSeatingZones, { name: '', capacity: 1, description: '' }]);
  };

  const removeSeatingZone = (index: number) => {
    if (formSeatingZones.length === 1) {
      toast({
        title: 'Cannot remove last seating zone',
        description: 'Events must have at least one seating zone',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const updatedSeatingZones = formSeatingZones.filter((_, i) => i !== index);
    setFormSeatingZones(updatedSeatingZones);

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
    onChange(updatedSeatingZones as SeatingZone[]);
  };

  const getTotalSeatingCapacity = (): number => {
    return formSeatingZones.reduce((total, sz) => total + (sz.capacity || 0), 0);
  };

  const getCapacityUtilization = (): number => {
    if (!venueCapacity || venueCapacity === 0) return 0;
    return Math.min((getTotalSeatingCapacity() / venueCapacity) * 100, 100);
  };

  const isOverCapacity = (): boolean => {
    return venueCapacity ? getTotalSeatingCapacity() > venueCapacity : false;
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading as="h3" size="lg" mb={2} color="neutral.900">
            Seating Configuration
          </Heading>
          <Text color="secondary.500" fontSize="sm">
            Define seating areas and zones for your event
          </Text>
        </Box>

        <VStack spacing={4} align="stretch">
          {formSeatingZones.map((seatingZone, index) => (
            <Box key={index} borderWidth="1px" borderColor="neutral.200" borderRadius="md" p={4}>
              <HStack justify="space-between" mb={4}>
                <Heading as="h4" size="sm" color="neutral.700">
                  Seating Zone {index + 1}
                </Heading>
                {!isReadOnly && formSeatingZones.length > 1 && (
                  <IconButton
                    aria-label={`Remove seating zone ${index + 1}`}
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="error"
                    variant="ghost"
                    onClick={() => removeSeatingZone(index)}
                  />
                )}
              </HStack>

              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={!!errors[index]?.name} isReadOnly={isReadOnly}>
                  <FormLabel htmlFor={`zone-name-${index}`}>Zone Name</FormLabel>
                  <Input
                    id={`zone-name-${index}`}
                    type="text"
                    value={seatingZone.name}
                    onChange={(e) => handleSeatingZoneChange(index, 'name', e.target.value)}
                    placeholder="e.g., Orchestra, Balcony, VIP Section"
                    size="md"
                    aria-describedby={errors[index]?.name ? `zone-name-error-${index}` : undefined}
                  />
                  <FormErrorMessage id={`zone-name-error-${index}`}>
                    {errors[index]?.name}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors[index]?.capacity} isReadOnly={isReadOnly}>
                  <FormLabel htmlFor={`zone-capacity-${index}`}>Capacity</FormLabel>
                  <NumberInput
                    value={seatingZone.capacity}
                    onChange={(valueString, valueNumber) => 
                      handleSeatingZoneChange(index, 'capacity', isNaN(valueNumber) ? 1 : Math.floor(valueNumber))
                    }
                    min={1}
                    max={999999}
                    step={1}
                    isReadOnly={isReadOnly}
                  >
                    <NumberInputField
                      id={`zone-capacity-${index}`}
                      placeholder="1"
                      aria-describedby={errors[index]?.capacity ? `zone-capacity-error-${index}` : undefined}
                    />
                    {!isReadOnly && (
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    )}
                  </NumberInput>
                  <FormErrorMessage id={`zone-capacity-error-${index}`}>
                    {errors[index]?.capacity}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isReadOnly={isReadOnly}>
                  <FormLabel htmlFor={`zone-description-${index}`}>Description (Optional)</FormLabel>
                  <Textarea
                    id={`zone-description-${index}`}
                    value={seatingZone.description || ''}
                    onChange={(e) => handleSeatingZoneChange(index, 'description', e.target.value)}
                    placeholder="Describe this seating area (e.g., best views, accessible seating)"
                    resize="vertical"
                    minH="80px"
                    size="md"
                  />
                </FormControl>

                <Box bg="neutral.50" p={3} borderRadius="md">
                  <Text fontSize="sm" color="secondary.600">
                    <strong>Zone capacity:</strong> {seatingZone.capacity?.toLocaleString() || 0} seats
                  </Text>
                </Box>
              </VStack>
            </Box>
          ))}
        </VStack>

        {!isReadOnly && (
          <Button
            leftIcon={<AddIcon />}
            onClick={addSeatingZone}
            colorScheme="primary"
            variant="outline"
            size="md"
            isDisabled={formSeatingZones.length >= 20}
            aria-label="Add new seating zone"
          >
            Add Another Seating Zone
          </Button>
        )}

        <Divider />

        <Box bg="primary.50" p={4} borderRadius="md">
          <VStack spacing={3} align="start">
            <Heading as="h4" size="sm" color="primary.700">
              Seating Summary
            </Heading>
            
            <HStack justify="space-between" w="full">
              <Text color="primary.600" fontWeight="medium">
                Total Seating Capacity:
              </Text>
              <Text color="primary.700" fontWeight="bold">
                {getTotalSeatingCapacity().toLocaleString()} seats
              </Text>
            </HStack>

            {venueCapacity && (
              <>
                <HStack justify="space-between" w="full">
                  <Text color="primary.600" fontWeight="medium">
                    Venue Capacity:
                  </Text>
                  <Text color="primary.700" fontWeight="bold">
                    {venueCapacity.toLocaleString()} seats
                  </Text>
                </HStack>

                <Box w="full">
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm" color="primary.600">
                      Capacity Utilization
                    </Text>
                    <Text fontSize="sm" color="primary.600" fontWeight="medium">
                      {getCapacityUtilization().toFixed(1)}%
                    </Text>
                  </HStack>
                  <Progress
                    value={getCapacityUtilization()}
                    colorScheme={isOverCapacity() ? "error" : "primary"}
                    size="sm"
                    borderRadius="md"
                  />
                </Box>
              </>
            )}
          </VStack>
        </Box>

        {isOverCapacity() && (
          <Alert status="warning">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">Seating exceeds venue capacity</Text>
              <Text fontSize="sm">
                Your seating zones have a total capacity of {getTotalSeatingCapacity().toLocaleString()} seats, 
                which exceeds the venue capacity of {venueCapacity?.toLocaleString()} seats by {' '}
                {(getTotalSeatingCapacity() - (venueCapacity || 0)).toLocaleString()} seats.
              </Text>
            </VStack>
          </Alert>
        )}

        {Object.keys(errors).length > 0 && (
          <Alert status="error">
            <AlertIcon />
            Please correct the errors in the seating configuration above.
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default SeatingConfiguration;