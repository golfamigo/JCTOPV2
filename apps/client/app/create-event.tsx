import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import EventCreateForm from '../src/components/features/event/EventCreateForm';
import eventService from '../src/services/eventService';
import { useAuthStore } from '../src/stores/authStore';
import { CreateEventDto, Category, Venue } from '@jctop-event/shared-types';

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [venues, setVenues] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load categories and venues
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [authLoading, isAuthenticated, navigate]);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    setError(null);
    
    try {
      const [categoriesData, venuesData] = await Promise.all([
        eventService.getCategories(),
        eventService.getVenues(),
      ]);

      setCategories(categoriesData.map(cat => ({ id: cat.id, name: cat.name })));
      setVenues(venuesData.map(venue => ({ id: venue.id, name: venue.name })));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load initial data';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleEventSubmit = async (eventData: CreateEventDto) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const createdEvent = await eventService.createEvent(eventData);
      
      toast({
        title: 'Event Created Successfully!',
        description: `"${createdEvent.title}" has been created as a draft.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect to event management or dashboard
      // For now, just go back to previous page or home
      navigate('/dashboard'); // Assuming there's a dashboard route
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      setError(errorMessage);
      toast({
        title: 'Error Creating Event',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="primary.500" />
      </Center>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxW="container.lg" py={8}>
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      )}

      {isLoadingData ? (
        <Center py={12}>
          <Box textAlign="center">
            <Spinner size="lg" color="primary.500" mb={4} />
            <Box fontSize="lg" color="secondary.600">
              Loading categories and venues...
            </Box>
          </Box>
        </Center>
      ) : categories.length === 0 || venues.length === 0 ? (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Setup Required</AlertTitle>
            <AlertDescription>
              Categories and venues must be configured before creating events. 
              Please contact your administrator.
            </AlertDescription>
          </Box>
        </Alert>
      ) : (
        <EventCreateForm
          onSubmit={handleEventSubmit}
          isLoading={isSubmitting}
          categories={categories}
          venues={venues}
        />
      )}
    </Container>
  );
};

export default CreateEventPage;