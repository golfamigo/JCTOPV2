import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { Text, Card, Button, Input, Icon, Divider } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { SeatingZone, CreateSeatingZoneDto } from '@jctop-event/shared-types';
import { useAppTheme } from '../../../theme';

interface SeatingConfigurationProps {
  seatingZones: SeatingZone[];
  onChange: (seatingZones: SeatingZone[]) => void;
  venueCapacity?: number;
  isReadOnly?: boolean;
}

interface SeatingZoneFormData {
  id?: string;
  name: string;
  capacity: number;
  description?: string;
}

interface SeatingZoneErrors {
  name?: string;
  capacity?: string;
  description?: string;
}

const SeatingConfiguration: React.FC<SeatingConfigurationProps> = ({
  seatingZones,
  onChange,
  venueCapacity,
  isReadOnly = false,
}) => {
  const { colors } = useAppTheme();
  const [formSeatingZones, setFormSeatingZones] = useState<SeatingZoneFormData[]>(
    seatingZones.length > 0 
      ? seatingZones.map(sz => ({ ...sz }))
      : [{ name: '', capacity: 1, description: '' }]
  );
  const [errors, setErrors] = useState<Record<number, SeatingZoneErrors>>({});

  const validateSeatingZone = (seatingZone: SeatingZoneFormData, index: number): SeatingZoneErrors => {
    const zoneErrors: SeatingZoneErrors = {};

    if (!seatingZone.name.trim()) {
      zoneErrors.name = 'Zone name is required';
    } else if (seatingZone.name.length > 255) {
      zoneErrors.name = 'Zone name cannot exceed 255 characters';
    } else {
      // Check for duplicate names
      const duplicateIndex = formSeatingZones.findIndex(
        (sz, idx) => idx !== index && sz.name.trim().toLowerCase() === seatingZone.name.trim().toLowerCase()
      );
      if (duplicateIndex !== -1) {
        zoneErrors.name = 'Zone name must be unique';
      }
    }

    if (seatingZone.capacity < 1) {
      zoneErrors.capacity = 'Capacity must be at least 1';
    } else if (seatingZone.capacity > 999999) {
      zoneErrors.capacity = 'Capacity cannot exceed 999,999';
    } else if (!Number.isInteger(seatingZone.capacity)) {
      zoneErrors.capacity = 'Capacity must be a whole number';
    }

    return zoneErrors;
  };

  const validateAllSeatingZones = (): boolean => {
    const newErrors: Record<number, SeatingZoneErrors> = {};
    let hasErrors = false;

    formSeatingZones.forEach((seatingZone, index) => {
      const zoneErrors = validateSeatingZone(seatingZone, index);
      if (Object.keys(zoneErrors).length > 0) {
        newErrors[index] = zoneErrors;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSeatingZoneChange = (index: number, field: keyof SeatingZoneFormData, value: string | number) => {
    const updatedSeatingZones = [...formSeatingZones];
    updatedSeatingZones[index] = { ...updatedSeatingZones[index], [field]: value };
    setFormSeatingZones(updatedSeatingZones);

    // Clear errors for this field
    if (errors[index]?.[field as keyof SeatingZoneErrors]) {
      const updatedErrors = { ...errors };
      if (updatedErrors[index]) {
        delete updatedErrors[index][field as keyof SeatingZoneErrors];
        if (Object.keys(updatedErrors[index]).length === 0) {
          delete updatedErrors[index];
        }
      }
      setErrors(updatedErrors);
    }

    // Update parent component
    if (validateAllSeatingZones()) {
      onChange(updatedSeatingZones as SeatingZone[]);
    }
  };

  const addSeatingZone = () => {
    if (formSeatingZones.length >= 20) {
      Alert.alert(
        'Maximum seating zones reached',
        'You can create up to 20 seating zones per event'
      );
      return;
    }

    setFormSeatingZones([...formSeatingZones, { name: '', capacity: 1, description: '' }]);
  };

  const removeSeatingZone = (index: number) => {
    if (formSeatingZones.length === 1) {
      Alert.alert(
        'Cannot remove last seating zone',
        'Events must have at least one seating zone'
      );
      return;
    }

    const updatedSeatingZones = formSeatingZones.filter((_, i) => i !== index);
    setFormSeatingZones(updatedSeatingZones);

    // Remove errors for removed item and adjust indices
    const updatedErrors = { ...errors };
    delete updatedErrors[index];
    
    // Shift errors for items after removed index
    Object.keys(updatedErrors).forEach(key => {
      const keyNum = parseInt(key);
      if (keyNum > index) {
        updatedErrors[keyNum - 1] = updatedErrors[keyNum];
        delete updatedErrors[keyNum];
      }
    });
    
    setErrors(updatedErrors);
    onChange(updatedSeatingZones as SeatingZone[]);
  };

  const getTotalSeatingCapacity = (): number => {
    return formSeatingZones.reduce((total, sz) => total + (sz.capacity || 0), 0);
  };

  const getCapacityUtilization = (): number => {
    if (!venueCapacity || venueCapacity === 0) return 0;
    return Math.min((getTotalSeatingCapacity() / venueCapacity) * 100, 100);
  };

  const isOverCapacity = (): boolean => {
    return venueCapacity ? getTotalSeatingCapacity() > venueCapacity : false;
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text h3 style={[styles.title, { color: colors.text }]}>
            Seating Configuration
          </Text>
          <Text style={[styles.subtitle, { color: colors.grey2 }]}>
            Define seating areas and zones for your event
          </Text>
        </View>

        {formSeatingZones.map((seatingZone, index) => (
          <Card key={index} containerStyle={[styles.zoneCard, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.zoneTitle, { color: colors.text }]}>
                Seating Zone {index + 1}
              </Text>
              {!isReadOnly && formSeatingZones.length > 1 && (
                <Icon
                  name="delete"
                  type="material"
                  color={colors.error}
                  size={24}
                  onPress={() => removeSeatingZone(index)}
                />
              )}
            </View>

            <View style={styles.formFields}>
              {/* Zone Name */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Zone Name *
                </Text>
                <Input
                  placeholder="e.g., Orchestra, Balcony, VIP Section"
                  value={seatingZone.name}
                  onChangeText={(value) => handleSeatingZoneChange(index, 'name', value)}
                  disabled={isReadOnly}
                  errorMessage={errors[index]?.name}
                  inputContainerStyle={[
                    styles.inputContainer,
                    { borderColor: errors[index]?.name ? colors.error : colors.grey4 }
                  ]}
                />
              </View>

              {/* Capacity */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Capacity *
                </Text>
                <Input
                  placeholder="1"
                  value={seatingZone.capacity.toString()}
                  onChangeText={(value) => {
                    const numValue = parseInt(value) || 0;
                    handleSeatingZoneChange(index, 'capacity', numValue);
                  }}
                  keyboardType="number-pad"
                  disabled={isReadOnly}
                  errorMessage={errors[index]?.capacity}
                  inputContainerStyle={[
                    styles.inputContainer,
                    { borderColor: errors[index]?.capacity ? colors.error : colors.grey4 }
                  ]}
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Description (Optional)
                </Text>
                <Input
                  placeholder="Describe this seating area (e.g., best views, accessible seating)"
                  value={seatingZone.description || ''}
                  onChangeText={(value) => handleSeatingZoneChange(index, 'description', value)}
                  disabled={isReadOnly}
                  multiline
                  numberOfLines={3}
                  inputContainerStyle={[
                    styles.textAreaContainer,
                    { borderColor: colors.grey4 }
                  ]}
                  inputStyle={{ textAlignVertical: 'top', minHeight: 80 }}
                />
              </View>

              {/* Zone Summary */}
              <View style={[styles.zoneSummary, { backgroundColor: colors.grey5 }]}>
                <Text style={[styles.summaryText, { color: colors.grey2 }]}>
                  Zone capacity: {seatingZone.capacity?.toLocaleString() || 0} seats
                </Text>
              </View>
            </View>
          </Card>
        ))}

        {!isReadOnly && (
          <Button
            title="Add Another Seating Zone"
            onPress={addSeatingZone}
            type="outline"
            disabled={formSeatingZones.length >= 20}
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
        )}

        <Divider style={styles.divider} />

        {/* Summary Card */}
        <Card containerStyle={[styles.summaryCard, { backgroundColor: colors.primary + '10' }]}>
          <Text h4 style={[styles.summaryTitle, { color: colors.primary }]}>
            Seating Summary
          </Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>
              Total Seating Capacity:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {getTotalSeatingCapacity().toLocaleString()} seats
            </Text>
          </View>

          {venueCapacity && (
            <>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  Venue Capacity:
                </Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  {venueCapacity.toLocaleString()} seats
                </Text>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: colors.text }]}>
                    Capacity Utilization
                  </Text>
                  <Text style={[styles.progressValue, { color: colors.primary }]}>
                    {getCapacityUtilization().toFixed(1)}%
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.grey5 }]}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        backgroundColor: isOverCapacity() ? colors.error : colors.primary,
                        width: `${Math.min(getCapacityUtilization(), 100)}%`
                      }
                    ]}
                  />
                </View>
              </View>
            </>
          )}
        </Card>

        {isOverCapacity() && (
          <View style={[styles.warningBox, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
            <Icon
              name="warning"
              type="material"
              color={colors.warning}
              size={20}
              containerStyle={styles.warningIcon}
            />
            <View style={styles.warningContent}>
              <Text style={[styles.warningTitle, { color: colors.warning }]}>
                Seating exceeds venue capacity
              </Text>
              <Text style={[styles.warningText, { color: colors.grey2 }]}>
                Your seating zones have a total capacity of {getTotalSeatingCapacity().toLocaleString()} seats, 
                which exceeds the venue capacity of {venueCapacity?.toLocaleString()} seats by {' '}
                {(getTotalSeatingCapacity() - (venueCapacity || 0)).toLocaleString()} seats.
              </Text>
            </View>
          </View>
        )}

        {Object.keys(errors).length > 0 && (
          <View style={[styles.errorBox, { backgroundColor: colors.error + '10', borderColor: colors.error }]}>
            <Icon
              name="error"
              type="material"
              color={colors.error}
              size={20}
              containerStyle={styles.errorIcon}
            />
            <Text style={[styles.errorText, { color: colors.error }]}>
              Please correct the errors in the seating configuration above.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  zoneCard: {
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
  zoneTitle: {
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
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  zoneSummary: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    borderRadius: 8,
    borderWidth: 2,
    paddingVertical: 12,
    marginVertical: 16,
  },
  divider: {
    marginVertical: 24,
  },
  summaryCard: {
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  warningIcon: {
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
});

export default SeatingConfiguration;