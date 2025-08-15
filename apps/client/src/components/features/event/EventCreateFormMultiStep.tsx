import React, { useState } from 'react';
import { View, ScrollView, Alert, StyleSheet, Platform } from 'react-native';
import { Button, Input, Text, Card, Divider } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { CreateEventDto, TicketType, SeatingZone } from '@jctop-event/shared-types';
import { useAppTheme } from '../../../theme';
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
  const { colors, spacing } = useAppTheme();
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
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [seatingZones, setSeatingZones] = useState<SeatingZone[]>([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const steps = [
    { title: 'Basic Info', description: 'Event details' },
    { title: 'Date & Location', description: 'When and where' },
    { title: 'Tickets', description: 'Pricing and capacity' },
    { title: 'Seating', description: 'Optional seating zones' },
    { title: 'Review', description: 'Confirm details' },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};
    
    switch (step) {
      case 0:
        if (!formData.title.trim()) {
          newErrors.title = 'Event title is required';
        }
        if (!formData.description.trim()) {
          newErrors.description = 'Event description is required';
        }
        break;
      case 1:
        if (!formData.startDate) {
          newErrors.startDate = 'Start date is required';
        }
        if (!formData.endDate) {
          newErrors.endDate = 'End date is required';
        }
        if (formData.startDate && formData.endDate) {
          const start = new Date(formData.startDate);
          const end = new Date(formData.endDate);
          if (end < start) {
            newErrors.endDate = 'End date must be after start date';
          }
        }
        if (!formData.location.trim()) {
          newErrors.location = 'Location is required';
        }
        break;
      case 2:
        if (ticketTypes.length === 0) {
          Alert.alert('Error', 'At least one ticket type is required');
          return false;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined, type: 'start' | 'end') => {
    if (type === 'start') {
      setShowStartPicker(false);
      if (selectedDate) {
        setStartDate(selectedDate);
        handleInputChange('startDate', selectedDate.toISOString());
      }
    } else {
      setShowEndPicker(false);
      if (selectedDate) {
        setEndDate(selectedDate);
        handleInputChange('endDate', selectedDate.toISOString());
      }
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      const eventData = {
        ...formData,
        categoryId: formData.categoryId || undefined,
        venueId: formData.venueId || undefined,
        ticketTypes,
        seatingZones,
      };
      onSubmit(eventData);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Basic Information</Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Event Title *</Text>
              <Input
                placeholder="Enter event title"
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                errorMessage={errors.title}
                disabled={isLoading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
              <Input
                placeholder="Enter event description"
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline
                numberOfLines={4}
                errorMessage={errors.description}
                disabled={isLoading}
                inputStyle={{ textAlignVertical: 'top' }}
              />
            </View>

            {categories.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Category</Text>
                <View style={[styles.pickerContainer, { borderColor: colors.grey4 }]}>
                  <Picker
                    selectedValue={formData.categoryId}
                    onValueChange={(value) => handleInputChange('categoryId', value)}
                    enabled={!isLoading}
                    style={{ color: colors.text }}
                  >
                    <Picker.Item label="Select a category" value="" />
                    {categories.map(category => (
                      <Picker.Item
                        key={category.id}
                        label={category.name}
                        value={category.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Date & Location</Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Start Date *</Text>
              <Button
                title={formData.startDate ? new Date(formData.startDate).toLocaleString() : 'Select start date'}
                onPress={() => setShowStartPicker(true)}
                type="outline"
                buttonStyle={[styles.dateButton, { borderColor: errors.startDate ? colors.error : colors.grey4 }]}
                titleStyle={{ color: formData.startDate ? colors.text : colors.grey3 }}
              />
              {errors.startDate && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.startDate}</Text>
              )}
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="datetime"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => handleDateChange(event, date, 'start')}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>End Date *</Text>
              <Button
                title={formData.endDate ? new Date(formData.endDate).toLocaleString() : 'Select end date'}
                onPress={() => setShowEndPicker(true)}
                type="outline"
                buttonStyle={[styles.dateButton, { borderColor: errors.endDate ? colors.error : colors.grey4 }]}
                titleStyle={{ color: formData.endDate ? colors.text : colors.grey3 }}
              />
              {errors.endDate && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.endDate}</Text>
              )}
              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="datetime"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => handleDateChange(event, date, 'end')}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Location *</Text>
              <Input
                placeholder="Enter event location"
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                errorMessage={errors.location}
                disabled={isLoading}
              />
            </View>

            {venues.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Venue</Text>
                <View style={[styles.pickerContainer, { borderColor: colors.grey4 }]}>
                  <Picker
                    selectedValue={formData.venueId}
                    onValueChange={(value) => handleInputChange('venueId', value)}
                    enabled={!isLoading}
                    style={{ color: colors.text }}
                  >
                    <Picker.Item label="Select a venue" value="" />
                    {venues.map(venue => (
                      <Picker.Item
                        key={venue.id}
                        label={venue.name}
                        value={venue.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Ticket Configuration</Text>
            <TicketConfiguration
              ticketTypes={ticketTypes}
              onChange={setTicketTypes}
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Seating Configuration (Optional)</Text>
            <SeatingConfiguration
              seatingZones={seatingZones}
              onChange={setSeatingZones}
              venueCapacity={venues.find(v => v.id === formData.venueId)?.capacity}
            />
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Review & Confirm</Text>
            
            <Card containerStyle={styles.reviewCard}>
              <Text h4 style={{ marginBottom: spacing.md }}>Event Details</Text>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Title:</Text>
                <Text style={styles.reviewValue}>{formData.title}</Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Description:</Text>
                <Text style={styles.reviewValue}>{formData.description}</Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Start Date:</Text>
                <Text style={styles.reviewValue}>
                  {formData.startDate ? new Date(formData.startDate).toLocaleString() : 'Not set'}
                </Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>End Date:</Text>
                <Text style={styles.reviewValue}>
                  {formData.endDate ? new Date(formData.endDate).toLocaleString() : 'Not set'}
                </Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Location:</Text>
                <Text style={styles.reviewValue}>{formData.location}</Text>
              </View>
              
              <Divider style={{ marginVertical: spacing.md }} />
              
              <Text h4 style={{ marginBottom: spacing.md }}>Tickets</Text>
              {ticketTypes.map((ticket, index) => (
                <View key={index} style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>{ticket.name}:</Text>
                  <Text style={styles.reviewValue}>
                    NT${ticket.price} ({ticket.quantity} available)
                  </Text>
                </View>
              ))}
              
              {seatingZones.length > 0 && (
                <>
                  <Divider style={{ marginVertical: spacing.md }} />
                  <Text h4 style={{ marginBottom: spacing.md }}>Seating Zones</Text>
                  {seatingZones.map((zone, index) => (
                    <View key={index} style={styles.reviewItem}>
                      <Text style={styles.reviewLabel}>{zone.name}:</Text>
                      <Text style={styles.reviewValue}>{zone.capacity} seats</Text>
                    </View>
                  ))}
                </>
              )}
            </Card>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card containerStyle={styles.container}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.grey5 }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: colors.primary,
                  width: `${((currentStep + 1) / steps.length) * 100}%`
                }
              ]} 
            />
          </View>
        </View>

        <StepIndicator
          steps={steps}
          currentStep={currentStep}
        />

        <Divider style={{ marginVertical: spacing.lg }} />

        {renderStepContent()}

        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <Button
              title="Previous"
              type="outline"
              onPress={handlePrevious}
              disabled={isLoading}
              buttonStyle={styles.navButton}
            />
          )}
          
          {currentStep < steps.length - 1 ? (
            <Button
              title="Next"
              onPress={handleNext}
              disabled={isLoading}
              buttonStyle={[styles.navButton, { backgroundColor: colors.primary }]}
            />
          ) : (
            <Button
              title="Create Event"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              buttonStyle={[styles.navButton, { backgroundColor: colors.success }]}
            />
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  stepContent: {
    paddingVertical: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  reviewCard: {
    borderRadius: 8,
    padding: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewLabel: {
    fontWeight: '500',
    marginRight: 8,
    minWidth: 100,
  },
  reviewValue: {
    flex: 1,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  navButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
  },
});

export default EventCreateFormMultiStep;