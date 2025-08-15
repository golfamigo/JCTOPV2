import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { Overlay, Button, Text, Input } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { CreateDiscountCodeDto, UpdateDiscountCodeDto, DiscountCodeResponse } from '@jctop-event/shared-types';
import { useAppTheme } from '../../../theme';

interface DiscountCodeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDiscountCodeDto | UpdateDiscountCodeDto) => Promise<void>;
  initialData?: DiscountCodeResponse;
  isLoading?: boolean;
}

interface FormData {
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  expiresAt: string;
}

interface FormErrors {
  code?: string;
  type?: string;
  value?: string;
  expiresAt?: string;
}

const DiscountCodeForm: React.FC<DiscountCodeFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const { colors } = useAppTheme();
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState<FormData>({
    code: initialData?.code || '',
    type: initialData?.type || 'percentage',
    value: initialData?.value || 0,
    expiresAt: initialData?.expiresAt 
      ? new Date(initialData.expiresAt).toISOString()
      : '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    formData.expiresAt ? new Date(formData.expiresAt) : new Date()
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Discount code is required';
    } else if (formData.code.length < 2) {
      newErrors.code = 'Discount code must be at least 2 characters';
    }

    if (!formData.type) {
      newErrors.type = 'Discount type is required';
    }

    if (formData.value <= 0) {
      newErrors.value = 'Value must be greater than 0';
    } else if (formData.type === 'percentage' && formData.value > 100) {
      newErrors.value = 'Percentage cannot exceed 100%';
    }

    if (formData.expiresAt) {
      const expiresDate = new Date(formData.expiresAt);
      if (expiresDate <= new Date()) {
        newErrors.expiresAt = 'Expiration date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Sanitize and format the code for security and consistency
      const sanitizedCode = formData.code
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, ''); // Remove any non-alphanumeric characters

      const submitData = {
        code: sanitizedCode,
        type: formData.type,
        value: Number(formData.value), // Ensure proper number formatting
        expiresAt: formData.expiresAt || undefined,
      };

      await onSubmit(submitData);
      handleClose();
      
      Alert.alert(
        'Success',
        `Discount code ${isEditing ? 'updated' : 'created'} successfully`
      );
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to ${isEditing ? 'update' : 'create'} discount code: ${
          error instanceof Error ? error.message : 'An unexpected error occurred'
        }`
      );
    }
  };

  const handleClose = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      expiresAt: '',
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
      handleInputChange('expiresAt', selectedDate.toISOString());
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleString();
  };

  return (
    <Overlay
      isVisible={isOpen}
      onBackdropPress={handleClose}
      overlayStyle={[styles.overlay, { backgroundColor: colors.card }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text h4 style={[styles.title, { color: colors.text }]}>
            {isEditing ? 'Edit Discount Code' : 'Create Discount Code'}
          </Text>
        </View>

        <View style={styles.form}>
          {/* Discount Code Input */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Discount Code *
            </Text>
            <Input
              placeholder="Enter discount code (e.g., SUMMER25)"
              value={formData.code}
              onChangeText={(text) => {
                // Auto-format: uppercase and alphanumeric only
                const formatted = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
                handleInputChange('code', formatted);
              }}
              maxLength={50}
              errorMessage={errors.code}
              inputContainerStyle={[
                styles.inputContainer,
                { borderColor: errors.code ? colors.error : colors.grey4 }
              ]}
            />
          </View>

          {/* Discount Type Picker */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Discount Type *
            </Text>
            {Platform.OS === 'ios' ? (
              <View style={[styles.pickerContainer, { 
                borderColor: errors.type ? colors.error : colors.grey4,
                backgroundColor: colors.grey5
              }]}>
                <Picker
                  selectedValue={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                  style={{ color: colors.text }}
                >
                  <Picker.Item label="Percentage (%)" value="percentage" />
                  <Picker.Item label="Fixed Amount ($)" value="fixed_amount" />
                </Picker>
              </View>
            ) : (
              <View style={[styles.pickerContainer, { 
                borderColor: errors.type ? colors.error : colors.grey4 
              }]}>
                <Picker
                  selectedValue={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                  style={{ color: colors.text }}
                >
                  <Picker.Item label="Percentage (%)" value="percentage" />
                  <Picker.Item label="Fixed Amount ($)" value="fixed_amount" />
                </Picker>
              </View>
            )}
            {errors.type && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.type}
              </Text>
            )}
          </View>

          {/* Value Input */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'} *
            </Text>
            <Input
              placeholder={`Enter ${formData.type === 'percentage' ? 'percentage' : 'amount'}`}
              value={formData.value.toString()}
              onChangeText={(text) => {
                const value = parseFloat(text) || 0;
                handleInputChange('value', value);
              }}
              keyboardType="decimal-pad"
              errorMessage={errors.value}
              inputContainerStyle={[
                styles.inputContainer,
                { borderColor: errors.value ? colors.error : colors.grey4 }
              ]}
            />
          </View>

          {/* Expiration Date */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Expiration Date (Optional)
            </Text>
            
            {Platform.OS === 'web' ? (
              <Input
                placeholder="Select expiration date"
                value={formatDate(formData.expiresAt)}
                onFocus={() => setShowDatePicker(true)}
                errorMessage={errors.expiresAt}
                inputContainerStyle={[
                  styles.inputContainer,
                  { borderColor: errors.expiresAt ? colors.error : colors.grey4 }
                ]}
                rightIcon={
                  <MaterialIcons 
                    name="date-range" 
                    size={24} 
                    color={colors.grey2}
                    onPress={() => setShowDatePicker(true)}
                  />
                }
              />
            ) : (
              <>
                <Button
                  title={formData.expiresAt ? formatDate(formData.expiresAt) : 'Select Date'}
                  onPress={() => setShowDatePicker(true)}
                  type="outline"
                  buttonStyle={[styles.dateButton, { 
                    borderColor: errors.expiresAt ? colors.error : colors.grey4 
                  }]}
                  titleStyle={{ color: colors.text }}
                  icon={
                    <MaterialIcons 
                      name="date-range" 
                      size={20} 
                      color={colors.grey2}
                      style={{ marginRight: 8 }}
                    />
                  }
                />
                {errors.expiresAt && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.expiresAt}
                  </Text>
                )}
              </>
            )}
          </View>

          {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={selectedDate}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={handleClose}
            type="outline"
            buttonStyle={[styles.button, { borderColor: colors.grey3 }]}
            titleStyle={{ color: colors.text }}
          />
          <Button
            title={isEditing ? 'Update' : 'Create'}
            onPress={handleSubmit}
            loading={isLoading}
            buttonStyle={[styles.button, { backgroundColor: colors.primary }]}
          />
        </View>
      </ScrollView>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    borderRadius: 12,
    padding: 0,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  dateButton: {
    borderRadius: 8,
    justifyContent: 'flex-start',
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    gap: 12,
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: 24,
  },
});

export default DiscountCodeForm;