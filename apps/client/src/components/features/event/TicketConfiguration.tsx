import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Input, Icon } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { TicketType, CreateTicketTypeDto } from '@jctop-event/shared-types';
import { useAppTheme } from '../../../theme';

interface TicketConfigurationProps {
  ticketTypes: TicketType[];
  onChange: (ticketTypes: TicketType[]) => void;
  isReadOnly?: boolean;
}

interface TicketTypeFormData {
  id?: string;
  name: string;
  price: number;
  quantity: number;
}

interface TicketTypeErrors {
  name?: string;
  price?: string;
  quantity?: string;
}

const TicketConfiguration: React.FC<TicketConfigurationProps> = ({
  ticketTypes,
  onChange,
  isReadOnly = false,
}) => {
  const { colors } = useAppTheme();
  const [formTicketTypes, setFormTicketTypes] = useState<TicketTypeFormData[]>(
    ticketTypes.length > 0 
      ? ticketTypes.map(tt => ({ ...tt }))
      : [{ name: '', price: 0, quantity: 1 }]
  );
  const [errors, setErrors] = useState<Record<number, TicketTypeErrors>>({});

  const validateTicketType = (ticketType: TicketTypeFormData, index: number): TicketTypeErrors => {
    const ticketErrors: TicketTypeErrors = {};

    if (!ticketType.name.trim()) {
      ticketErrors.name = 'Ticket name is required';
    } else if (ticketType.name.length > 255) {
      ticketErrors.name = 'Ticket name cannot exceed 255 characters';
    } else {
      // Check for duplicate names
      const duplicateIndex = formTicketTypes.findIndex(
        (tt, idx) => idx !== index && tt.name.trim().toLowerCase() === ticketType.name.trim().toLowerCase()
      );
      if (duplicateIndex !== -1) {
        ticketErrors.name = 'Ticket name must be unique';
      }
    }

    if (ticketType.price < 0) {
      ticketErrors.price = 'Price cannot be negative';
    } else if (ticketType.price > 999999.99) {
      ticketErrors.price = 'Price cannot exceed $999,999.99';
    }

    if (ticketType.quantity < 1) {
      ticketErrors.quantity = 'Quantity must be at least 1';
    } else if (ticketType.quantity > 999999) {
      ticketErrors.quantity = 'Quantity cannot exceed 999,999';
    }

    return ticketErrors;
  };

  const validateAllTicketTypes = (): boolean => {
    const newErrors: Record<number, TicketTypeErrors> = {};
    let isValid = true;

    formTicketTypes.forEach((ticketType, index) => {
      const ticketErrors = validateTicketType(ticketType, index);
      if (Object.keys(ticketErrors).length > 0) {
        newErrors[index] = ticketErrors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleAddTicketType = () => {
    setFormTicketTypes([...formTicketTypes, { name: '', price: 0, quantity: 1 }]);
  };

  const handleRemoveTicketType = (index: number) => {
    if (formTicketTypes.length === 1) {
      Alert.alert('Error', 'At least one ticket type is required');
      return;
    }

    const newTicketTypes = formTicketTypes.filter((_, i) => i !== index);
    setFormTicketTypes(newTicketTypes);
    
    // Update errors
    const newErrors = { ...errors };
    delete newErrors[index];
    // Reindex errors for items after the removed index
    Object.keys(newErrors).forEach(key => {
      const idx = parseInt(key);
      if (idx > index) {
        newErrors[idx - 1] = newErrors[idx];
        delete newErrors[idx];
      }
    });
    setErrors(newErrors);
  };

  const handleTicketTypeChange = (index: number, field: keyof TicketTypeFormData, value: string | number) => {
    const newTicketTypes = [...formTicketTypes];
    newTicketTypes[index] = {
      ...newTicketTypes[index],
      [field]: field === 'name' ? value : Number(value) || 0
    };
    setFormTicketTypes(newTicketTypes);

    // Clear error for this field if it exists
    if (errors[index]?.[field as keyof TicketTypeErrors]) {
      const newErrors = { ...errors };
      if (newErrors[index]) {
        delete newErrors[index][field as keyof TicketTypeErrors];
        if (Object.keys(newErrors[index]).length === 0) {
          delete newErrors[index];
        }
      }
      setErrors(newErrors);
    }
  };

  const handleSave = () => {
    if (validateAllTicketTypes()) {
      // Convert formTicketTypes to TicketType format
      const validTicketTypes = formTicketTypes.map(tt => ({
        id: tt.id || `temp-${Date.now()}-${Math.random()}`,
        eventId: '', // Will be set by parent
        name: tt.name.trim(),
        price: tt.price,
        quantity: tt.quantity,
      }));
      onChange(validTicketTypes as TicketType[]);
      Alert.alert('Success', 'Ticket configuration saved successfully');
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {formTicketTypes.map((ticketType, index) => (
          <Card key={index} containerStyle={[styles.ticketCard, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.ticketTitle, { color: colors.text }]}>
                Ticket Type {index + 1}
              </Text>
              {!isReadOnly && formTicketTypes.length > 1 && (
                <Icon
                  name="delete"
                  type="material"
                  color={colors.error}
                  size={24}
                  onPress={() => handleRemoveTicketType(index)}
                />
              )}
            </View>

            <View style={styles.formFields}>
              {/* Ticket Name */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Ticket Name *
                </Text>
                <Input
                  placeholder="e.g., General Admission, VIP"
                  value={ticketType.name}
                  onChangeText={(value) => handleTicketTypeChange(index, 'name', value)}
                  disabled={isReadOnly}
                  errorMessage={errors[index]?.name}
                  inputContainerStyle={[
                    styles.inputContainer,
                    { borderColor: errors[index]?.name ? colors.error : colors.grey4 }
                  ]}
                />
              </View>

              {/* Price and Quantity Row */}
              <View style={styles.row}>
                {/* Price */}
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Price ($) *
                  </Text>
                  <Input
                    placeholder="0.00"
                    value={ticketType.price.toString()}
                    onChangeText={(value) => handleTicketTypeChange(index, 'price', value)}
                    keyboardType="decimal-pad"
                    disabled={isReadOnly}
                    errorMessage={errors[index]?.price}
                    inputContainerStyle={[
                      styles.inputContainer,
                      { borderColor: errors[index]?.price ? colors.error : colors.grey4 }
                    ]}
                    leftIcon={
                      <Text style={{ color: colors.grey2 }}>$</Text>
                    }
                  />
                </View>

                {/* Quantity */}
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Quantity *
                  </Text>
                  <Input
                    placeholder="1"
                    value={ticketType.quantity.toString()}
                    onChangeText={(value) => handleTicketTypeChange(index, 'quantity', value)}
                    keyboardType="number-pad"
                    disabled={isReadOnly}
                    errorMessage={errors[index]?.quantity}
                    inputContainerStyle={[
                      styles.inputContainer,
                      { borderColor: errors[index]?.quantity ? colors.error : colors.grey4 }
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Ticket Summary */}
            <View style={[styles.summary, { backgroundColor: colors.grey5 }]}>
              <Text style={[styles.summaryText, { color: colors.grey2 }]}>
                {ticketType.quantity || 0} tickets at ${ticketType.price || 0} each
              </Text>
              <Text style={[styles.summaryTotal, { color: colors.text }]}>
                Total: ${((ticketType.quantity || 0) * (ticketType.price || 0)).toFixed(2)}
              </Text>
            </View>
          </Card>
        ))}

        {!isReadOnly && (
          <View style={styles.actions}>
            <Button
              title="Add Ticket Type"
              onPress={handleAddTicketType}
              type="outline"
              buttonStyle={[styles.addButton, { borderColor: colors.primary }]}
              titleStyle={{ color: colors.primary }}
              icon={
                <Icon
                  name="add"
                  type="material"
                  color={colors.primary}
                  size={20}
                  containerStyle={{ marginRight: 8 }}
                />
              }
            />

            <Button
              title="Save Configuration"
              onPress={handleSave}
              buttonStyle={[styles.saveButton, { backgroundColor: colors.primary }]}
              icon={
                <Icon
                  name="save"
                  type="material"
                  color={colors.white}
                  size={20}
                  containerStyle={{ marginRight: 8 }}
                />
              }
            />
          </View>
        )}

        {/* Total Summary */}
        <Card containerStyle={[styles.totalCard, { backgroundColor: colors.primary + '10' }]}>
          <View style={styles.totalContent}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Total Event Capacity:
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {formTicketTypes.reduce((sum, tt) => sum + (tt.quantity || 0), 0)} tickets
            </Text>
          </View>
          <View style={styles.totalContent}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Price Range:
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              ${Math.min(...formTicketTypes.map(tt => tt.price || 0)).toFixed(2)} - 
              ${Math.max(...formTicketTypes.map(tt => tt.price || 0)).toFixed(2)}
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  ticketCard: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  formFields: {
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
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  summary: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  summaryText: {
    fontSize: 14,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  actions: {
    gap: 12,
    marginVertical: 16,
  },
  addButton: {
    borderRadius: 8,
    borderWidth: 2,
    paddingVertical: 12,
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  totalCard: {
    borderRadius: 12,
    marginTop: 16,
  },
  totalContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TicketConfiguration;