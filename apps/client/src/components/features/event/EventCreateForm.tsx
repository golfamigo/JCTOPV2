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
} from '@chakra-ui/react';
import { CreateEventDto } from '@jctop-event/shared-types';

interface EventCreateFormProps {
  onSubmit: (eventData: CreateEventDto) => void;
  isLoading?: boolean;
  categories?: { id: string; name: string }[];
  venues?: { id: string; name: string }[];
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

const EventCreateForm: React.FC<EventCreateFormProps> = ({
  onSubmit,
  isLoading = false,
  categories = [],
  venues = [],
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    categoryId: '',
    venueId: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please correct the errors in the form',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: CreateEventDto = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      location: formData.location.trim(),
      categoryId: formData.categoryId,
      venueId: formData.venueId,
    };

    onSubmit(eventData);
  };

  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 6 }}>
      <Heading as="h1" size="xl" mb={6} color="neutral.900">
        Create New Event
      </Heading>

      <form onSubmit={handleSubmit}>
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

          <Box pt={4}>
            <Button
              type="submit"
              colorScheme="primary"
              size="lg"
              width="full"
              isLoading={isLoading}
              loadingText="Creating Event..."
              aria-describedby="create-button-help"
            >
              Create Event
            </Button>
            <Box id="create-button-help" fontSize="sm" color="secondary.500" mt={2} textAlign="center">
              Event will be saved as a draft
            </Box>
          </Box>
        </VStack>
      </form>
    </Box>
  );
};

export default EventCreateForm;