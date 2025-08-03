import React, { useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { ChakraProvider, useToast } from '@chakra-ui/react';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Event, TicketSelection, RegistrationFormData, PaymentResponse } from '@jctop-event/shared-types';
import RegistrationStepOne from '../../../components/features/event/RegistrationStepOne';
import RegistrationStepTwo from '../../../components/features/event/RegistrationStepTwo';
import PaymentStep from '../../../components/features/event/PaymentStep';
import PaymentStatusPage from '../../../components/features/event/PaymentStatusPage';
import eventService from '../../../services/eventService';
import theme from '../../../theme';

/**
 * Event Registration Page Component
 * 
 * This page handles the multi-step registration process for events.
 * It orchestrates the flow between ticket selection and registration details.
 * 
 * Features:
 * - Multi-step registration flow with step indicator
 * - Ticket selection with real-time validation
 * - Dynamic custom field rendering
 * - Discount code validation and application
 * - Form state persistence across steps
 * - Responsive design for all device sizes
 * - Loading states and error handling
 * 
 * Route: app/event/[id]/register.tsx (for Expo Router)
 */
export default function EventRegistrationPage() {
  const router = useRouter();
  const { id: eventId } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();

  // State management
  const [event, setEvent] = useState<Event | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1); // Add payment and confirmation steps
  const [ticketSelections, setTicketSelections] = useState<TicketSelection[]>([]);
  const [registrationData, setRegistrationData] = useState<Partial<RegistrationFormData>>({});
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    if (!eventId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Load public event details
      const eventData = await eventService.getPublicEventById(eventId);
      setEvent(eventData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load event details';
      setError(errorMessage);
      toast({
        title: 'Loading Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepOneNext = (selections: TicketSelection[]) => {
    setTicketSelections(selections);
    setCurrentStep(2);
  };

  const handleStepOneCancel = () => {
    // Navigate back to event details or events list
    router.back();
  };

  const handleStepTwoNext = (formData: RegistrationFormData) => {
    setRegistrationData(formData);
    
    // Move to payment step
    setCurrentStep(3);
  };

  const handleStepTwoBack = () => {
    setCurrentStep(1);
  };

  const handlePaymentSuccess = (response: PaymentResponse) => {
    setPaymentResponse(response);
    setCurrentStep(4); // Move to payment status/confirmation step
    
    toast({
      title: '付款處理中',
      description: '正在處理您的付款，請稍候...',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  const handlePaymentBack = () => {
    setCurrentStep(2);
  };

  const handlePaymentStatusSuccess = () => {
    toast({
      title: '報名成功！',
      description: '恭喜您成功報名活動，即將為您導向活動頁面',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    
    // Navigate back to event page after short delay
    setTimeout(() => {
      router.push(`/event/${eventId}`);
    }, 2000);
  };

  const handlePaymentStatusFailure = () => {
    // Go back to payment step to retry
    setCurrentStep(3);
  };

  const handlePaymentStatusCancel = () => {
    // Go back to payment step
    setCurrentStep(3);
  };

  if (isLoading) {
    return (
      <ChakraProvider theme={theme}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <StatusBar style="dark" />
          {/* Loading spinner would be here */}
        </View>
      </ChakraProvider>
    );
  }

  if (error || !event) {
    return (
      <ChakraProvider theme={theme}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <StatusBar style="dark" />
          {/* Error message would be here */}
        </View>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 1 && (
            <RegistrationStepOne
              event={event}
              onNext={handleStepOneNext}
              onCancel={handleStepOneCancel}
              initialSelections={ticketSelections}
              isLoading={isLoading}
            />
          )}

          {currentStep === 2 && (
            <RegistrationStepTwo
              event={event}
              ticketSelections={ticketSelections}
              onNext={handleStepTwoNext}
              onBack={handleStepTwoBack}
              initialFormData={registrationData}
              isLoading={isLoading}
            />
          )}

          {currentStep === 3 && registrationData && (
            <PaymentStep
              event={event}
              formData={registrationData as RegistrationFormData}
              onSuccess={handlePaymentSuccess}
              onBack={handlePaymentBack}
              isLoading={isLoading}
            />
          )}

          {currentStep === 4 && paymentResponse && (
            <PaymentStatusPage
              paymentId={paymentResponse.paymentId}
              eventId={eventId}
              onSuccess={handlePaymentStatusSuccess}
              onFailure={handlePaymentStatusFailure}
              onCancel={handlePaymentStatusCancel}
            />
          )}
        </ScrollView>
      </View>
    </ChakraProvider>
  );
}