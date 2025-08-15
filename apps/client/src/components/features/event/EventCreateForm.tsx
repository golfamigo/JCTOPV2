import React, { useState } from 'react';
import { View, ScrollView, Alert, StyleSheet, Platform } from 'react-native';
import { Button, Input, Text, Card } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CreateEventDto } from '@jctop-event/shared-types';
import { useAppTheme } from '../../../theme';

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
  const { colors } = useAppTheme();
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
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    }
    
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
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
    if (validateForm()) {
      const eventData: CreateEventDto = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location.trim(),
        categoryId: formData.categoryId || undefined,
        venueId: formData.venueId || undefined,
      };
      onSubmit(eventData);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card containerStyle={[styles.card, { backgroundColor: colors.card }]}>
        <Text h3 style={[styles.title, { color: colors.text }]}>
          Create New Event
        </Text>
        
        <View style={styles.formContainer}>
          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Event Title *
            </Text>
            <Input
              placeholder="Enter event title"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              errorMessage={errors.title}
              disabled={isLoading}
              inputContainerStyle={[
                styles.inputContainer,
                { borderColor: errors.title ? colors.error : colors.grey4 }
              ]}
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Description *
            </Text>
            <Input
              placeholder="Enter event description"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
              errorMessage={errors.description}
              disabled={isLoading}
              inputContainerStyle={[
                styles.textAreaContainer,
                { borderColor: errors.description ? colors.error : colors.grey4 }
              ]}
              inputStyle={{ textAlignVertical: 'top' }}
            />
          </View>

          {/* Start Date */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Start Date *
            </Text>
            <Button
              title={formData.startDate ? new Date(formData.startDate).toLocaleString() : 'Select start date'}
              onPress={() => setShowStartPicker(true)}
              type="outline"
              buttonStyle={[
                styles.dateButton,
                { borderColor: errors.startDate ? colors.error : colors.grey4 }
              ]}
              titleStyle={{ color: formData.startDate ? colors.text : colors.grey3 }}
            />
            {errors.startDate && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.startDate}
              </Text>
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

          {/* End Date */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              End Date *
            </Text>
            <Button
              title={formData.endDate ? new Date(formData.endDate).toLocaleString() : 'Select end date'}
              onPress={() => setShowEndPicker(true)}
              type="outline"
              buttonStyle={[
                styles.dateButton,
                { borderColor: errors.endDate ? colors.error : colors.grey4 }
              ]}
              titleStyle={{ color: formData.endDate ? colors.text : colors.grey3 }}
            />
            {errors.endDate && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.endDate}
              </Text>
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

          {/* Location */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Location *
            </Text>
            <Input
              placeholder="Enter event location"
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              errorMessage={errors.location}
              disabled={isLoading}
              inputContainerStyle={[
                styles.inputContainer,
                { borderColor: errors.location ? colors.error : colors.grey4 }
              ]}
            />
          </View>

          {/* Category */}
          {categories.length > 0 && (
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Category
              </Text>
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

          {/* Venue */}
          {venues.length > 0 && (
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Venue
              </Text>
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

          {/* Submit Button */}
          <Button
            title="Create Event"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            buttonStyle={[styles.submitButton, { backgroundColor: colors.primary }]}
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  formContainer: {
    gap: 16,
  },
  formGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 100,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
  },
});

export default EventCreateForm;