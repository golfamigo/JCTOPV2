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
  Card,
  CardBody,
  useToast,
  Divider,
  SimpleGrid,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { Event, TicketSelection, CustomRegistrationField, RegistrationFormData, DiscountValidationResponse } from '@jctop-event/shared-types';
import StepIndicator from '../../common/StepIndicator';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import DiscountCodeInput from './DiscountCodeInput';
import registrationService from '../../../services/registrationService';

interface RegistrationStepTwoProps {
  event: Event;
  ticketSelections: TicketSelection[];
  onNext: (formData: RegistrationFormData) => void;
  onBack: () => void;
  initialFormData?: Partial<RegistrationFormData>;
  isLoading?: boolean;
}

interface FieldErrors {
  [fieldId: string]: string;
}

const RegistrationStepTwo: React.FC<RegistrationStepTwoProps> = ({
  event,
  ticketSelections,
  onNext,
  onBack,
  initialFormData = {},
  isLoading = false,
}) => {
  const [customFields, setCustomFields] = useState<CustomRegistrationField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoadingFields, setIsLoadingFields] = useState(true);
  const [discountResult, setDiscountResult] = useState<DiscountValidationResponse | null>(null);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const toast = useToast();

  // Design system colors following branding guide
  const cardBgColor = useColorModeValue('white', '#1E293B');
  const primaryColor = '#2563EB';
  const borderColor = useColorModeValue('#E2E8F0', '#475569');
  const neutralLight = '#F8FAFC';
  const neutralMedium = '#64748B';
  const errorColor = '#EF4444';

  const registrationSteps = [
    { title: 'Ticket Selection', description: 'Choose your tickets' },
    { title: 'Registration', description: 'Enter your details' },
    { title: 'Payment', description: 'Complete purchase' },
  ];

  // Calculate base total from ticket selections
  const baseTotal = ticketSelections.reduce((total, selection) => {
    // TODO: Get actual ticket prices from ticket types
    // For now, assume a default price structure
    return total + (selection.quantity * 50); // Placeholder price
  }, 0);

  const finalTotal = discountResult?.valid ? discountResult.finalAmount : baseTotal;

  useEffect(() => {
    loadCustomFields();
  }, [event.id]);

  useEffect(() => {
    // Initialize field values from initial form data
    if (initialFormData.customFieldValues) {
      setFieldValues(initialFormData.customFieldValues);
    }
  }, [initialFormData]);

  const loadCustomFields = async () => {
    try {
      setIsLoadingFields(true);
      setLoadingError(null);
      const fields = await registrationService.getCustomFields(event.id);
      setCustomFields(fields);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load registration fields';
      setLoadingError(errorMessage);
      toast({
        title: 'Loading Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingFields(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[fieldId]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateField = (field: CustomRegistrationField, value: any): string | null => {
    // Required field validation
    if (field.required) {
      if (field.fieldType === 'checkbox') {
        if (!value) {
          return `${field.label} is required`;
        }
      } else {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return `${field.label} is required`;
        }
      }
    }

    // Type-specific validation
    if (value && typeof value === 'string') {
      // Email validation
      if (field.fieldType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
      }

      // Validation rules
      if (field.validationRules) {
        const { minLength, maxLength, pattern } = field.validationRules;

        if (minLength && value.length < minLength) {
          return `${field.label} must be at least ${minLength} characters`;
        }

        if (maxLength && value.length > maxLength) {
          return `${field.label} must not exceed ${maxLength} characters`;
        }

        if (pattern) {
          const regex = new RegExp(pattern);
          if (!regex.test(value)) {
            return `${field.label} format is invalid`;
          }
        }
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    customFields.forEach(field => {
      const value = fieldValues[field.id];
      const error = validateField(field, value);
      if (error) {
        errors[field.id] = error;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      toast({
        title: 'Form Validation Error',
        description: 'Please fix the errors below and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData: RegistrationFormData = {
        ticketSelections,
        customFieldValues: fieldValues,
        discountCode: appliedDiscountCode,
        totalAmount: finalTotal,
        discountAmount: discountResult?.valid ? discountResult.discountAmount : 0,
      };

      onNext(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process registration';
      toast({
        title: 'Processing Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscountApplied = (result: DiscountValidationResponse, code?: string) => {
    setDiscountResult(result);
    setAppliedDiscountCode(result.valid ? code || null : null);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (isLoadingFields) {
    return (
      <Container maxW="4xl" py={8}>
        <Center py={20}>
          <VStack spacing={4}>
            <Spinner size="xl" color={primaryColor} />
            <Text color={neutralMedium}>Loading registration form...</Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  if (loadingError) {
    return (
      <Container maxW="4xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <StepIndicator
              steps={registrationSteps}
              currentStep={1}
              size="md"
            />
          </Box>
          
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <AlertDescription fontWeight="semibold">
                Failed to load registration form
              </AlertDescription>
              <AlertDescription fontSize="sm">
                {loadingError}
              </AlertDescription>
              <Button size="sm" onClick={loadCustomFields} colorScheme="red" variant="outline">
                Try Again
              </Button>
            </VStack>
          </Alert>

          <HStack justify="space-between">
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="outline"
              onClick={onBack}
              borderColor={borderColor}
              color={neutralMedium}
            >
              Back to Tickets
            </Button>
          </HStack>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Step Indicator */}
        <Box>
          <StepIndicator
            steps={registrationSteps}
            currentStep={1}
            size="md"
          />
        </Box>

        {/* Page Header */}
        <Box>
          <Heading size="lg" color={primaryColor} mb={2}>
            Registration Details
          </Heading>
          <Text color={neutralMedium}>
            Please fill out the required information to complete your registration for {event.title}.
          </Text>
        </Box>

        {/* Custom Fields Form */}
        {customFields.length > 0 && (
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color={primaryColor}>
                  Required Information
                </Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {customFields.map((field) => (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      value={fieldValues[field.id]}
                      onChange={(value) => handleFieldChange(field.id, value)}
                      error={fieldErrors[field.id]}
                      isDisabled={isLoading || isSubmitting}
                    />
                  ))}
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Discount Code Section */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md" color={primaryColor}>
                Discount Code
              </Heading>
              
              <DiscountCodeInput
                eventId={event.id}
                totalAmount={baseTotal}
                onDiscountApplied={handleDiscountApplied}
                isDisabled={isLoading || isSubmitting}
              />
            </VStack>
          </CardBody>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md" color={primaryColor}>
                Order Summary
              </Heading>
              
              <VStack spacing={3} align="stretch">
                {ticketSelections.map((selection, index) => (
                  <HStack key={index} justify="space-between">
                    <Text>
                      Ticket × {selection.quantity}
                    </Text>
                    <Text fontWeight="semibold">
                      {formatPrice(selection.quantity * 50)} {/* Placeholder price */}
                    </Text>
                  </HStack>
                ))}
                
                {discountResult?.valid && (
                  <>
                    <Divider />
                    <HStack justify="space-between" color={errorColor}>
                      <Text>Discount</Text>
                      <Text fontWeight="semibold">
                        -{formatPrice(discountResult.discountAmount)}
                      </Text>
                    </HStack>
                  </>
                )}
                
                <Divider />
                <HStack justify="space-between" fontSize="lg" fontWeight="bold">
                  <Text color={primaryColor}>Total</Text>
                  <Text color={primaryColor}>
                    {formatPrice(finalTotal)}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <HStack justify="space-between" pt={4}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="outline"
            onClick={onBack}
            isDisabled={isLoading || isSubmitting}
            borderColor={borderColor}
            color={neutralMedium}
            _hover={{
              borderColor: primaryColor,
              color: primaryColor,
            }}
          >
            Back to Tickets
          </Button>

          <Button
            rightIcon={<ArrowForwardIcon />}
            colorScheme="blue"
            onClick={handleNext}
            isLoading={isSubmitting}
            loadingText="Processing..."
            isDisabled={isLoading}
            size="lg"
            backgroundColor={primaryColor}
            _hover={{
              backgroundColor: '#1D4ED8',
            }}
            _active={{
              backgroundColor: '#1E40AF',
            }}
          >
            Continue to Payment
          </Button>
        </HStack>

        {/* Footer Notice */}
        <Box
          p={4}
          backgroundColor={neutralLight}
          borderRadius="md"
          borderWidth={1}
          borderColor={borderColor}
        >
          <Text fontSize="sm" color={neutralMedium} textAlign="center">
            Your information is secure and will only be used for event registration purposes.
            No payment will be processed until the final step.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default RegistrationStepTwo;