import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  FormErrorMessage,
  Heading,
  useToast,
  Progress,
  Divider,
} from '@chakra-ui/react';
import { CreateEventDto, TicketType, SeatingZone } from '@jctop-event/shared-types';
import StepIndicator from '../../common/StepIndicator';
import TicketConfiguration from './TicketConfiguration';
import SeatingConfiguration from './SeatingConfiguration';

interface EventCreateFormMultiStepProps {
  onSubmit: (eventData: CreateEventDto & { ticketTypes: TicketType[]; seatingZones: SeatingZone[] }) => void;
  isLoading?: boolean;
  categories?: { id: string; name: string; }[];
  venues?: { id: string; name: string; capacity?: number; }[];
}

interface FormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  categoryId: string;
  venueId: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  categoryId?: string;
  venueId?: string;
}

const EventCreateFormMultiStep: React.FC<EventCreateFormMultiStepProps> = ({
  onSubmit,
  isLoading = false,
  categories = [],
  venues = [],
}) => {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    categoryId: '',
    venueId: '',
  });
  
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [seatingZones, setSeatingZones] = useState<SeatingZone[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const steps = [
    {
      title: 'Event Details',
      description: 'Basic event information',
    },
    {
      title: 'Tickets & Seating',
      description: 'Configure pricing and capacity',
    },
    {
      title: 'Review & Submit',
      description: 'Confirm and create event',
    },
  ];

  const validateEventDetails = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title cannot exceed 255 characters';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else if (new Date(formData.startDate) <= new Date()) {
      newErrors.startDate = 'Start date must be in the future';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.venueId) {
      newErrors.venueId = 'Venue is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTicketsAndSeating = (): boolean => {
    let isValid = true;

    if (ticketTypes.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one ticket type is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      isValid = false;
    }

    if (seatingZones.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one seating zone is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      isValid = false;
    }

    // Check for duplicate ticket names
    const ticketNames = ticketTypes.map(tt => tt.name.trim().toLowerCase());
    const uniqueTicketNames = new Set(ticketNames);
    if (ticketNames.length !== uniqueTicketNames.size) {
      toast({
        title: 'Validation Error',
        description: 'Ticket names must be unique',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      isValid = false;
    }

    // Check for duplicate seating zone names
    const zoneNames = seatingZones.map(sz => sz.name.trim().toLowerCase());
    const uniqueZoneNames = new Set(zoneNames);
    if (zoneNames.length !== uniqueZoneNames.size) {
      toast({
        title: 'Validation Error',
        description: 'Seating zone names must be unique',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      isValid = false;
    }

    return isValid;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!validateEventDetails()) {
        toast({
          title: 'Validation Error',
          description: 'Please correct the errors in the form',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    } else if (currentStep === 1) {
      if (!validateTicketsAndSeating()) {
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    if (!validateEventDetails() || !validateTicketsAndSeating()) {
      toast({
        title: 'Validation Error',
        description: 'Please correct all errors before submitting',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: CreateEventDto & { ticketTypes: TicketType[]; seatingZones: SeatingZone[] } = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      location: formData.location.trim(),
      categoryId: formData.categoryId,
      venueId: formData.venueId,
      ticketTypes,
      seatingZones,
    };

    onSubmit(eventData);
  };

  const getSelectedVenue = () => {
    return venues.find(venue => venue.id === formData.venueId);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <VStack spacing={6} align="stretch">
            <FormControl isRequired isInvalid={!!errors.title}>
              <FormLabel htmlFor="title">Event Title</FormLabel>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                size="md"
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              <FormErrorMessage id="title-error">{errors.title}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="description">Description</FormLabel>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter event description (optional)"
                resize="vertical"
                minH="100px"
              />
            </FormControl>

            <HStack spacing={4} align="flex-start">
              <FormControl isRequired isInvalid={!!errors.startDate} flex={1}>
                <FormLabel htmlFor="startDate">Start Date & Time</FormLabel>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  size="md"
                  aria-describedby={errors.startDate ? 'start-date-error' : undefined}
                />
                <FormErrorMessage id="start-date-error">{errors.startDate}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.endDate} flex={1}>
                <FormLabel htmlFor="endDate">End Date & Time</FormLabel>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  size="md"
                  aria-describedby={errors.endDate ? 'end-date-error' : undefined}
                />
                <FormErrorMessage id="end-date-error">{errors.endDate}</FormErrorMessage>
              </FormControl>
            </HStack>

            <FormControl isRequired isInvalid={!!errors.location}>
              <FormLabel htmlFor="location">Location</FormLabel>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter event location"
                size="md"
                aria-describedby={errors.location ? 'location-error' : undefined}
              />
              <FormErrorMessage id="location-error">{errors.location}</FormErrorMessage>
            </FormControl>

            <HStack spacing={4} align="flex-start">
              <FormControl isRequired isInvalid={!!errors.categoryId} flex={1}>
                <FormLabel htmlFor="categoryId">Category</FormLabel>
                <Select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  placeholder="Select a category"
                  size="md"
                  aria-describedby={errors.categoryId ? 'category-error' : undefined}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage id="category-error">{errors.categoryId}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.venueId} flex={1}>
                <FormLabel htmlFor="venueId">Venue</FormLabel>
                <Select
                  id="venueId"
                  value={formData.venueId}
                  onChange={(e) => handleInputChange('venueId', e.target.value)}
                  placeholder="Select a venue"
                  size="md"
                  aria-describedby={errors.venueId ? 'venue-error' : undefined}
                >
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage id="venue-error">{errors.venueId}</FormErrorMessage>
              </FormControl>
            </HStack>
          </VStack>
        );

      case 1:
        return (
          <VStack spacing={8} align="stretch">
            <TicketConfiguration 
              ticketTypes={ticketTypes}
              onChange={setTicketTypes}
            />
            
            <Divider />
            
            <SeatingConfiguration 
              seatingZones={seatingZones}
              onChange={setSeatingZones}
              venueCapacity={getSelectedVenue()?.capacity}
            />
          </VStack>
        );

      case 2:
        const selectedVenue = getSelectedVenue();
        const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
        const totalTicketCapacity = ticketTypes.reduce((sum, tt) => sum + tt.quantity, 0);
        const totalSeatingCapacity = seatingZones.reduce((sum, sz) => sum + sz.capacity, 0);
        const potentialRevenue = ticketTypes.reduce((sum, tt) => sum + (tt.price * tt.quantity), 0);

        return (
          <VStack spacing={6} align="stretch">
            <Heading as="h3" size="lg" color="neutral.900">
              Review Your Event
            </Heading>

            <Box borderWidth="1px" borderColor="neutral.200" borderRadius="md" p={4}>
              <Heading as="h4" size="md" mb={3} color="neutral.700">
                Event Details
              </Heading>
              <VStack spacing={2} align="start">
                <HStack justify="space-between" w="full">
                  <strong>Title:</strong>
                  <span>{formData.title}</span>
                </HStack>
                <HStack justify="space-between" w="full">
                  <strong>Category:</strong>
                  <span>{selectedCategory?.name}</span>
                </HStack>
                <HStack justify="space-between" w="full">
                  <strong>Venue:</strong>
                  <span>{selectedVenue?.name}</span>
                </HStack>
                <HStack justify="space-between" w="full">
                  <strong>Location:</strong>
                  <span>{formData.location}</span>
                </HStack>
                <HStack justify="space-between" w="full">
                  <strong>Start:</strong>
                  <span>{new Date(formData.startDate).toLocaleString()}</span>
                </HStack>
                <HStack justify="space-between" w="full">
                  <strong>End:</strong>
                  <span>{new Date(formData.endDate).toLocaleString()}</span>
                </HStack>
              </VStack>
            </Box>

            <Box borderWidth="1px" borderColor="neutral.200" borderRadius="md" p={4}>
              <Heading as="h4" size="md" mb={3} color="neutral.700">
                Ticket Types ({ticketTypes.length})
              </Heading>
              <VStack spacing={2} align="stretch">
                {ticketTypes.map((ticket, index) => (
                  <HStack key={index} justify="space-between" w="full">
                    <span>{ticket.name}</span>
                    <span>${ticket.price.toFixed(2)} × {ticket.quantity}</span>
                  </HStack>
                ))}
              </VStack>
            </Box>

            <Box borderWidth="1px" borderColor="neutral.200" borderRadius="md" p={4}>
              <Heading as="h4" size="md" mb={3} color="neutral.700">
                Seating Zones ({seatingZones.length})
              </Heading>
              <VStack spacing={2} align="stretch">
                {seatingZones.map((zone, index) => (
                  <HStack key={index} justify="space-between" w="full">
                    <span>{zone.name}</span>
                    <span>{zone.capacity} seats</span>
                  </HStack>
                ))}
              </VStack>
            </Box>

            <Box bg="primary.50" p={4} borderRadius="md">
              <Heading as="h4" size="sm" mb={3} color="primary.700">
                Event Summary
              </Heading>
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between" w="full">
                  <span>Total Ticket Capacity:</span>
                  <strong>{totalTicketCapacity.toLocaleString()}</strong>
                </HStack>
                <HStack justify="space-between" w="full">
                  <span>Total Seating Capacity:</span>
                  <strong>{totalSeatingCapacity.toLocaleString()}</strong>
                </HStack>
                <HStack justify="space-between" w="full">
                  <span>Potential Revenue:</span>
                  <strong>${potentialRevenue.toFixed(2)}</strong>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <Box maxW="800px" mx="auto" p={{ base: 4, md: 6 }}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2} color="neutral.900">
            Create New Event
          </Heading>
          <Progress 
            value={(currentStep / (steps.length - 1)) * 100} 
            colorScheme="primary" 
            size="sm" 
            borderRadius="full"
          />
        </Box>

        <StepIndicator 
          steps={steps}
          currentStep={currentStep}
          size="md"
        />

        <Box minH="400px">
          {renderStepContent()}
        </Box>

        <HStack justify="space-between" pt={4}>
          <Button
            variant="outline"
            onClick={handlePrevious}
            isDisabled={currentStep === 0}
            size="lg"
          >
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              colorScheme="primary"
              onClick={handleNext}
              size="lg"
            >
              Next
            </Button>
          ) : (
            <Button
              colorScheme="primary"
              onClick={handleSubmit}
              isLoading={isLoading}
              loadingText="Creating Event..."
              size="lg"
            >
              Create Event
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default EventCreateFormMultiStep;