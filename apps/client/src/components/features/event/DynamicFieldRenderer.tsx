import React from 'react';
import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Input, Text, CheckBox, Icon } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import { useAppTheme } from '@/theme';
import { CustomRegistrationField } from '@jctop-event/shared-types';

interface DynamicFieldRendererProps {
  field: CustomRegistrationField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  isDisabled?: boolean;
}

const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  isDisabled = false,
}) => {
  const { colors, spacing, typography } = useAppTheme();

  const renderField = () => {
    switch (field.fieldType) {
      case 'text':
        return (
          <Input
            placeholder={field.placeholder}
            value={value || ''}
            onChangeText={onChange}
            errorMessage={error}
            disabled={isDisabled}
            containerStyle={styles.inputContainer}
            inputStyle={styles.input}
            errorStyle={styles.errorText}
            placeholderTextColor={colors.midGrey}
          />
        );

      case 'email':
        return (
          <Input
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder={field.placeholder}
            value={value || ''}
            onChangeText={onChange}
            errorMessage={error}
            disabled={isDisabled}
            containerStyle={styles.inputContainer}
            inputStyle={styles.input}
            errorStyle={styles.errorText}
            placeholderTextColor={colors.midGrey}
          />
        );

      case 'number':
        return (
          <Input
            keyboardType="numeric"
            placeholder={field.placeholder}
            value={value ? String(value) : ''}
            onChangeText={(text) => {
              const numValue = text.replace(/[^0-9]/g, '');
              onChange(numValue ? parseInt(numValue, 10) : '');
            }}
            errorMessage={error}
            disabled={isDisabled}
            containerStyle={styles.inputContainer}
            inputStyle={styles.input}
            errorStyle={styles.errorText}
            placeholderTextColor={colors.midGrey}
          />
        );

      case 'textarea':
        return (
          <View>
            <TextInput
              multiline
              numberOfLines={4}
              placeholder={field.placeholder}
              value={value || ''}
              onChangeText={onChange}
              editable={!isDisabled}
              style={[
                styles.textArea,
                error ? styles.textAreaError : {},
                isDisabled ? styles.disabledInput : {},
              ]}
              placeholderTextColor={colors.midGrey}
              textAlignVertical="top"
            />
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>
        );

      case 'select':
        return (
          <View>
            <View style={[
              styles.pickerContainer,
              error ? styles.pickerError : {},
              isDisabled ? styles.disabledInput : {},
            ]}>
              <Picker
                selectedValue={value || ''}
                onValueChange={onChange}
                enabled={!isDisabled}
                style={styles.picker}
              >
                <Picker.Item 
                  label={field.placeholder || 'Select an option'} 
                  value="" 
                  color={colors.midGrey}
                />
                {field.options?.map((option) => (
                  <Picker.Item 
                    key={option} 
                    label={option} 
                    value={option}
                    color={colors.text}
                  />
                ))}
              </Picker>
            </View>
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>
        );

      case 'checkbox':
        return (
          <View>
            <CheckBox
              checked={!!value}
              onPress={() => !isDisabled && onChange(!value)}
              disabled={isDisabled}
              title={field.label}
              checkedColor={colors.primary}
              uncheckedColor={colors.midGrey}
              containerStyle={styles.checkboxContainer}
              textStyle={[styles.checkboxText, isDisabled && styles.disabledText]}
            />
            {error && (
              <Text style={[styles.errorText, { marginLeft: spacing.md }]}>{error}</Text>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    label: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    requiredMark: {
      color: colors.danger,
      marginLeft: 4,
    },
    inputContainer: {
      paddingHorizontal: 0,
    },
    input: {
      ...typography.body,
      color: colors.text,
    },
    textArea: {
      ...typography.body,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: spacing.sm,
      minHeight: 100,
      color: colors.text,
      backgroundColor: colors.white,
    },
    textAreaError: {
      borderColor: colors.danger,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.white,
      overflow: 'hidden',
    },
    pickerError: {
      borderColor: colors.danger,
    },
    picker: {
      height: 50,
      color: colors.text,
    },
    checkboxContainer: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      marginLeft: 0,
      marginRight: 0,
      paddingLeft: 0,
    },
    checkboxText: {
      ...typography.body,
      color: colors.text,
      fontWeight: 'normal',
    },
    disabledInput: {
      backgroundColor: colors.lightGrey,
      opacity: 0.7,
    },
    disabledText: {
      color: colors.midGrey,
    },
    errorText: {
      ...typography.small,
      color: colors.danger,
      marginTop: spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      {field.fieldType !== 'checkbox' && (
        <Text style={styles.label}>
          {field.label}
          {field.required && (
            <Text style={styles.requiredMark}>*</Text>
          )}
        </Text>
      )}
      
      {renderField()}
    </View>
  );
};

export default DynamicFieldRenderer;