import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Heading,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
  Container,
  Divider,
  Card,
  CardBody,
  useToast,
} from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { Event, TicketSelection } from '@jctop-event/shared-types';
import StepIndicator from '../../common/StepIndicator';
import TicketTypeSelector from './TicketTypeSelector';
import ticketService from '../../../services/ticketService';

interface RegistrationStepOneProps {
  event: Event;
  onNext: (selections: TicketSelection[]) => void;
  onCancel: () => void;
  initialSelections?: TicketSelection[];
  isLoading?: boolean;
}

const RegistrationStepOne: React.FC<RegistrationStepOneProps> = ({
  event,
  onNext,
  onCancel,
  initialSelections = [],
  isLoading = false,
}) => {
  const [selections, setSelections] = useState<TicketSelection[]>(initialSelections);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const toast = useToast();

  // Design system colors following branding guide
  const cardBgColor = useColorModeValue('white', '#1E293B');
  const primaryColor = '#2563EB';
  const borderColor = useColorModeValue('#E2E8F0', '#475569');
  const neutralLight = '#F8FAFC';
  const neutralMedium = '#64748B';

  const registrationSteps = [
    { title: 'Ticket Selection', description: 'Choose your tickets' },
    { title: 'Registration', description: 'Enter your details' },
    { title: 'Payment', description: 'Complete purchase' },
  ];

  useEffect(() => {
    setSelections(initialSelections);
  }, [initialSelections]);

  const handleSelectionChange = (newSelections: TicketSelection[], newTotalPrice: number) => {
    setSelections(newSelections);
    setTotalPrice(newTotalPrice);
    setValidationError(null);
  };

  const handleNext = async () => {
    if (selections.length === 0) {
      setValidationError('Please select at least one ticket to continue.');
      return;
    }

    if (totalPrice <= 0) {
      setValidationError('Invalid selection. Please check your ticket choices.');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Validate selections with server
      const validation = await ticketService.validateTicketSelection(event.id, selections);
      
      if (!validation.valid) {
        const errorMessages = validation.errors?.map(error => error.message).join(', ') || 'Invalid ticket selection';
        setValidationError(errorMessages);
        toast({
          title: 'Selection Invalid',
          description: errorMessages,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Proceed to next step
      onNext(selections);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate ticket selection';
      setValidationError(errorMessage);
      toast({
        title: 'Validation Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const hasSelections = selections.length > 0;
  const totalQuantity = selections.reduce((sum, selection) => sum + selection.quantity, 0);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Step Indicator */}
        <Box>
          <StepIndicator
            steps={registrationSteps}
            currentStep={0}
            size="md"
          />
        </Box>

        {/* Event Information Card */}
        <Card>
          <CardBody>
            <VStack align="start" spacing={4}>
              <Heading size="lg" color={primaryColor}>
                {event.title}
              </Heading>
              
              <VStack align="start" spacing={2}>
                <HStack>
                  <Text fontWeight="semibold" color={neutralMedium}>Date:</Text>
                  <Text>{formatDate(event.startDate)}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="semibold" color={neutralMedium}>Time:</Text>
                  <Text>{formatTime(event.startDate)} - {formatTime(event.endDate)}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="semibold" color={neutralMedium}>Location:</Text>
                  <Text>{event.location}</Text>
                </HStack>
              </VStack>

              {event.description && (
                <Box>
                  <Text fontWeight="semibold" color={neutralMedium} mb={2}>Description:</Text>
                  <Text color={neutralMedium}>{event.description}</Text>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Validation Error Alert */}
        {validationError && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {/* Ticket Selection */}
        <Card>
          <CardBody>
            <TicketTypeSelector
              eventId={event.id}
              onSelectionChange={handleSelectionChange}
              initialSelections={initialSelections}
              isDisabled={isLoading || isValidating}
            />
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <HStack justify="space-between" pt={4}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="outline"
            onClick={onCancel}
            isDisabled={isLoading || isValidating}
            borderColor={borderColor}
            color={neutralMedium}
            _hover={{
              borderColor: primaryColor,
              color: primaryColor,
            }}
          >
            Back to Event
          </Button>

          <HStack spacing={4}>
            {hasSelections && (
              <VStack align="end" spacing={1}>
                <Text fontSize="sm" color={neutralMedium}>
                  {totalQuantity} ticket{totalQuantity !== 1 ? 's' : ''} selected
                </Text>
                <Text fontSize="lg" fontWeight="bold" color={primaryColor}>
                  Total: {formatPrice(totalPrice)}
                </Text>
              </VStack>
            )}

            <Button
              rightIcon={<ArrowForwardIcon />}
              colorScheme="blue"
              onClick={handleNext}
              isLoading={isValidating}
              loadingText="Validating..."
              isDisabled={!hasSelections || isLoading}
              size="lg"
              backgroundColor={primaryColor}
              _hover={{
                backgroundColor: '#1D4ED8',
              }}
              _active={{
                backgroundColor: '#1E40AF',
              }}
            >
              Continue to Registration
            </Button>
          </HStack>
        </HStack>

        {/* Summary Footer */}
        {hasSelections && (
          <Box
            p={4}
            backgroundColor={neutralLight}
            borderRadius="md"
            borderWidth={1}
            borderColor={borderColor}
          >
            <VStack spacing={2}>
              <Text fontSize="sm" color={neutralMedium} textAlign="center">
                By continuing, you agree to reserve these tickets for 15 minutes while completing your registration.
                No payment will be processed until the final step.
              </Text>
              <Text fontSize="xs" color={neutralMedium} textAlign="center">
                Prices shown include all applicable fees and taxes.
              </Text>
            </VStack>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default RegistrationStepOne;