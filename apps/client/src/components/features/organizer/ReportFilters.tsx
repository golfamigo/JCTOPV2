import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, CheckBox, Card, Divider } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export interface ReportFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  eventIds?: string[];
  transactionTypes?: ('revenue' | 'expense' | 'refund')[];
  paymentMethods?: string[];
  minAmount?: number;
  maxAmount?: number;
}

interface ReportFiltersProps {
  filters: ReportFilters;
  onApply: (filters: ReportFilters) => void;
  onClear: () => void;
  events?: Array<{ id: string; title: string }>;
}

export const ReportFiltersComponent: React.FC<ReportFiltersProps> = ({
  filters: initialFilters,
  onApply,
  onClear,
  events = [],
}) => {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const borderRadius = 8;
  
  const [filters, setFilters] = useState<ReportFilters>(initialFilters);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Transaction type options
  const transactionTypes = [
    { key: 'revenue', label: t('organizer.reports.revenue'), icon: 'cash-plus' },
    { key: 'expense', label: t('organizer.reports.expenses'), icon: 'cash-minus' },
    { key: 'refund', label: t('organizer.reports.refunds'), icon: 'cash-refund' },
  ];

  // Payment method options
  const paymentMethods = [
    { key: 'credit_card', label: '信用卡' },
    { key: 'bank_transfer', label: '銀行轉帳' },
    { key: 'cash', label: '現金' },
    { key: 'ecpay', label: 'ECPay' },
  ];

  // Format date for display
  const formatDate = useCallback((date: Date) => {
    return format(date, 'yyyy年MM月dd日', { locale: zhTW });
  }, []);

  // Handle date range changes
  const handleStartDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setFilters(prev => ({
        ...prev,
        dateRange: { ...prev.dateRange, start: selectedDate }
      }));
    }
  }, []);

  const handleEndDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setFilters(prev => ({
        ...prev,
        dateRange: { ...prev.dateRange, end: selectedDate }
      }));
    }
  }, []);

  // Handle transaction type selection
  const handleTransactionTypeToggle = useCallback((type: string) => {
    setFilters(prev => {
      const types = prev.transactionTypes || [];
      const newTypes = types.includes(type as any)
        ? types.filter(t => t !== type)
        : [...types, type as 'revenue' | 'expense' | 'refund'];
      
      return { ...prev, transactionTypes: newTypes };
    });
  }, []);

  // Handle payment method selection
  const handlePaymentMethodToggle = useCallback((method: string) => {
    setFilters(prev => {
      const methods = prev.paymentMethods || [];
      const newMethods = methods.includes(method)
        ? methods.filter(m => m !== method)
        : [...methods, method];
      
      return { ...prev, paymentMethods: newMethods };
    });
  }, []);

  // Handle event selection
  const handleEventToggle = useCallback((eventId: string) => {
    setFilters(prev => {
      const eventIds = prev.eventIds || [];
      const newEventIds = eventIds.includes(eventId)
        ? eventIds.filter(id => id !== eventId)
        : [...eventIds, eventId];
      
      return { ...prev, eventIds: newEventIds };
    });
  }, []);

  // Apply filters
  const handleApply = useCallback(() => {
    onApply(filters);
  }, [filters, onApply]);

  // Clear all filters
  const handleClear = useCallback(() => {
    const clearedFilters: ReportFilters = {
      dateRange: {
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        end: new Date(),
      },
      transactionTypes: [],
      paymentMethods: [],
      eventIds: [],
    };
    setFilters(clearedFilters);
    onClear();
  }, [onClear]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Date Range Section */}
      <Card containerStyle={[styles.card, { backgroundColor: colors.white }]}>
        <Text style={[styles.sectionTitle, { color: colors.dark }]}>
          {t('organizer.reports.dateRange')}
        </Text>
        
        <View style={styles.dateRow}>
          <Button
            title={formatDate(filters.dateRange.start)}
            onPress={() => setShowStartPicker(true)}
            type="outline"
            icon={
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={colors.primary}
                style={{ marginRight: spacing.xs }}
              />
            }
            buttonStyle={[styles.dateButton, { borderColor: colors.primary }]}
            titleStyle={{ color: colors.primary }}
          />
          
          <Text style={[styles.dateSeparator, { color: colors.grey3 }]}>至</Text>
          
          <Button
            title={formatDate(filters.dateRange.end)}
            onPress={() => setShowEndPicker(true)}
            type="outline"
            icon={
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={colors.primary}
                style={{ marginRight: spacing.xs }}
              />
            }
            buttonStyle={[styles.dateButton, { borderColor: colors.primary }]}
            titleStyle={{ color: colors.primary }}
          />
        </View>
        
        {showStartPicker && (
          <DateTimePicker
            value={filters.dateRange.start}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}
        
        {showEndPicker && (
          <DateTimePicker
            value={filters.dateRange.end}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}
      </Card>

      {/* Event Selection */}
      {events.length > 0 && (
        <Card containerStyle={[styles.card, { backgroundColor: colors.white }]}>
          <Text style={[styles.sectionTitle, { color: colors.dark }]}>
            {t('organizer.reports.selectEvent')}
          </Text>
          
          <CheckBox
            title={t('organizer.reports.allEvents')}
            checked={!filters.eventIds || filters.eventIds.length === 0}
            onPress={() => setFilters(prev => ({ ...prev, eventIds: [] }))}
            containerStyle={styles.checkboxContainer}
            textStyle={{ color: colors.grey5 }}
            checkedColor={colors.primary}
          />
          
          <Divider style={{ marginVertical: spacing.sm }} />
          
          {events.map(event => (
            <CheckBox
              key={event.id}
              title={event.title}
              checked={filters.eventIds?.includes(event.id) || false}
              onPress={() => handleEventToggle(event.id)}
              containerStyle={styles.checkboxContainer}
              textStyle={{ color: colors.grey5 }}
              checkedColor={colors.primary}
            />
          ))}
        </Card>
      )}

      {/* Transaction Type Filter */}
      <Card containerStyle={[styles.card, { backgroundColor: colors.white }]}>
        <Text style={[styles.sectionTitle, { color: colors.dark }]}>
          {t('organizer.reports.transactionType')}
        </Text>
        
        {transactionTypes.map(type => (
          <CheckBox
            key={type.key}
            title={type.label}
            checked={filters.transactionTypes?.includes(type.key as any) || false}
            onPress={() => handleTransactionTypeToggle(type.key)}
            containerStyle={styles.checkboxContainer}
            textStyle={{ color: colors.grey5 }}
            checkedColor={colors.primary}
            iconType="material-community"
            checkedIcon="checkbox-marked"
            uncheckedIcon="checkbox-blank-outline"
          />
        ))}
      </Card>

      {/* Payment Method Filter */}
      <Card containerStyle={[styles.card, { backgroundColor: colors.white }]}>
        <Text style={[styles.sectionTitle, { color: colors.dark }]}>
          {t('organizer.reports.paymentMethod')}
        </Text>
        
        {paymentMethods.map(method => (
          <CheckBox
            key={method.key}
            title={method.label}
            checked={filters.paymentMethods?.includes(method.key) || false}
            onPress={() => handlePaymentMethodToggle(method.key)}
            containerStyle={styles.checkboxContainer}
            textStyle={{ color: colors.grey5 }}
            checkedColor={colors.primary}
            iconType="material-community"
            checkedIcon="checkbox-marked"
            uncheckedIcon="checkbox-blank-outline"
          />
        ))}
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          title={t('organizer.reports.clearFilters')}
          onPress={handleClear}
          type="outline"
          buttonStyle={[styles.actionButton, { borderColor: colors.grey3 }]}
          titleStyle={{ color: colors.grey3 }}
        />
        
        <Button
          title={t('organizer.reports.applyFilters')}
          onPress={handleApply}
          buttonStyle={[styles.actionButton, { backgroundColor: colors.primary }]}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButton: {
    flex: 1,
    borderRadius: 8,
  },
  dateSeparator: {
    marginHorizontal: 12,
    fontSize: 16,
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingHorizontal: 0,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
  },
});

export default ReportFiltersComponent;