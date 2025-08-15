import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Overlay, Input, Button, ButtonGroup, Text } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import discountCodeService from '@/services/discountCodeService';
import { DiscountCodeResponse as BaseDiscountCodeResponse, CreateDiscountCodeDto, UpdateDiscountCodeDto } from '@jctop-event/shared-types';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Clipboard from 'expo-clipboard';

interface DiscountCodeResponse extends BaseDiscountCodeResponse {
  status?: 'active' | 'inactive';
}

interface DiscountCodeFormModalProps {
  visible: boolean;
  eventId: string;
  discountCode?: DiscountCodeResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DiscountCodeFormModal({
  visible,
  eventId,
  discountCode,
  onClose,
  onSuccess,
}: DiscountCodeFormModalProps) {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const borderRadius = 8;
  
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [value, setValue] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when discount code changes
  useEffect(() => {
    if (discountCode) {
      setCode(discountCode.code);
      setType(discountCode.type);
      setValue(discountCode.value.toString());
      setExpiresAt(discountCode.expiresAt ? new Date(discountCode.expiresAt) : null);
    } else {
      resetForm();
    }
  }, [discountCode]);

  // Reset form
  const resetForm = () => {
    setCode('');
    setType('percentage');
    setValue('');
    setExpiresAt(null);
    setErrors({});
  };

  // Generate random code
  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 8;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setCode(result);
  };

  // Copy code to clipboard
  const copyToClipboard = async () => {
    if (code) {
      await Clipboard.setStringAsync(code);
      Alert.alert(t('common.success'), t('discounts.codeCopied'));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Code validation
    if (!code.trim()) {
      newErrors.code = t('discounts.validation.codeRequired');
    } else if (!/^[A-Z0-9-]+$/i.test(code)) {
      newErrors.code = t('discounts.validation.codePattern');
    }

    // Value validation
    const numValue = parseFloat(value);
    if (!value || isNaN(numValue)) {
      newErrors.value = t('discounts.validation.valueRequired');
    } else if (type === 'percentage' && (numValue < 1 || numValue > 100)) {
      newErrors.value = t('discounts.validation.percentageRange');
    } else if (type === 'fixed_amount' && numValue <= 0) {
      newErrors.value = t('discounts.validation.amountMin');
    }

    // Expiry validation
    if (expiresAt && expiresAt < new Date()) {
      newErrors.expiresAt = t('discounts.validation.expiryInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const data: CreateDiscountCodeDto | UpdateDiscountCodeDto = {
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
      };

      if (discountCode) {
        await discountCodeService.updateDiscountCode(eventId, discountCode.id, data);
        Alert.alert(t('common.success'), t('discounts.updateSuccess'));
      } else {
        await discountCodeService.createDiscountCode(eventId, data as CreateDiscountCodeDto);
        Alert.alert(t('common.success'), t('discounts.createSuccess'));
      }
      
      onSuccess();
    } catch (error) {
      Alert.alert(
        t('common.error'),
        discountCode ? t('discounts.updateError') : t('discounts.createError')
      );
    } finally {
      setLoading(false);
    }
  };

  // Format date display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onClose}
      overlayStyle={[styles.overlay, { backgroundColor: colors.white }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text h3 style={{ color: colors.dark }}>
              {discountCode ? t('discounts.editCode') : t('discounts.addNew')}
            </Text>
            <Button
              type="clear"
              onPress={onClose}
              icon={
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors.grey3}
                />
              }
            />
          </View>

          {/* Code Input with Generate and Copy */}
          <View style={styles.codeInputContainer}>
            <Input
              label={t('discounts.code')}
              placeholder="SUMMER20"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              errorMessage={errors.code}
              rightIcon={
                <View style={styles.codeActions}>
                  <Button
                    type="clear"
                    onPress={generateRandomCode}
                    icon={
                      <MaterialCommunityIcons
                        name="dice-5"
                        size={20}
                        color={colors.primary}
                      />
                    }
                  />
                  <Button
                    type="clear"
                    onPress={copyToClipboard}
                    disabled={!code}
                    icon={
                      <MaterialCommunityIcons
                        name="content-copy"
                        size={20}
                        color={code ? colors.primary : colors.grey3}
                      />
                    }
                  />
                </View>
              }
            />
          </View>

          {/* Discount Type Selection */}
          <View style={[styles.section, { marginBottom: spacing.md }]}>
            <Text style={[styles.label, { color: colors.grey5 }]}>
              {t('discounts.type')}
            </Text>
            <ButtonGroup
              buttons={[t('discounts.percentage'), t('discounts.fixedAmount')]}
              selectedIndex={type === 'percentage' ? 0 : 1}
              onPress={(index) => setType(index === 0 ? 'percentage' : 'fixed_amount')}
              containerStyle={[
                styles.buttonGroup,
                { 
                  backgroundColor: colors.white,
                  borderColor: colors.grey2,
                  borderRadius: borderRadius,
                }
              ]}
              selectedButtonStyle={{ backgroundColor: colors.primary }}
              textStyle={{ color: colors.grey3 }}
              selectedTextStyle={{ color: colors.white }}
            />
          </View>

          {/* Value Input */}
          <Input
            label={t('discounts.value')}
            placeholder={type === 'percentage' ? '20' : '100'}
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            errorMessage={errors.value}
            rightIcon={
              <Text style={{ color: colors.grey3 }}>
                {type === 'percentage' ? '%' : 'NT$'}
              </Text>
            }
          />

          {/* Expiry Date */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.grey5 }]}>
              {t('discounts.expiresAt')}
            </Text>
            <Button
              title={expiresAt ? formatDate(expiresAt) : t('common.selectDate')}
              type="outline"
              onPress={() => setShowDatePicker(true)}
              buttonStyle={[
                styles.dateButton,
                { borderColor: errors.expiresAt ? colors.error : colors.grey2 }
              ]}
              titleStyle={{ color: expiresAt ? colors.dark : colors.grey3 }}
              icon={
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color={colors.grey3}
                  style={{ marginRight: 8 }}
                />
              }
            />
            {expiresAt && (
              <Button
                title={t('common.clear')}
                type="clear"
                onPress={() => setExpiresAt(null)}
                titleStyle={{ color: colors.grey3, fontSize: 14 }}
              />
            )}
            {errors.expiresAt && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.expiresAt}
              </Text>
            )}
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={expiresAt || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setExpiresAt(selectedDate);
                }
              }}
              minimumDate={new Date()}
            />
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title={t('common.cancel')}
              type="outline"
              onPress={onClose}
              disabled={loading}
              containerStyle={styles.actionButton}
              buttonStyle={{ borderColor: colors.grey3 }}
              titleStyle={{ color: colors.grey3 }}
            />
            <Button
              title={discountCode ? t('common.update') : t('common.create')}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              containerStyle={styles.actionButton}
              buttonStyle={{ backgroundColor: colors.primary }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  overlay: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 12,
    padding: 0,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  codeInputContainer: {
    marginTop: 16,
  },
  codeActions: {
    flexDirection: 'row',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 10,
  },
  buttonGroup: {
    height: 40,
    borderWidth: 1,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});