import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  BottomSheet,
  ListItem,
  Text,
  Button,
  ButtonGroup,
  Icon,
  CheckBox,
  Divider,
} from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

export interface FilterOptions {
  sortBy: 'date' | 'registrations' | 'checkIns' | 'name';
  sortOrder: 'asc' | 'desc';
  eventStatus: ('published' | 'draft' | 'completed')[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

interface DashboardFiltersProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  isVisible,
  onClose,
  onApply,
  currentFilters,
}) => {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const sortOptions = [
    { value: 'date', label: t('organizer.sortByDate') },
    { value: 'registrations', label: t('organizer.sortByRegistrations') },
    { value: 'checkIns', label: t('organizer.sortByCheckIns') },
    { value: 'name', label: t('organizer.sortByName') },
  ];

  const statusOptions = [
    { value: 'published', label: t('organizer.published') },
    { value: 'draft', label: t('organizer.draft') },
    { value: 'completed', label: t('organizer.completed') },
  ];

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      sortBy: 'date',
      sortOrder: 'desc',
      eventStatus: ['published', 'draft', 'completed'],
      dateRange: {
        start: null,
        end: null,
      },
    };
    setFilters(defaultFilters);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const toggleStatus = (status: 'published' | 'draft' | 'completed') => {
    const newStatuses = filters.eventStatus.includes(status)
      ? filters.eventStatus.filter(s => s !== status)
      : [...filters.eventStatus, status];
    
    setFilters({ ...filters, eventStatus: newStatuses });
  };

  const handleDateChange = (type: 'start' | 'end', date?: Date) => {
    if (date) {
      setFilters({
        ...filters,
        dateRange: {
          ...filters.dateRange,
          [type]: date,
        },
      });
    }
    if (type === 'start') {
      setShowStartDatePicker(false);
    } else {
      setShowEndDatePicker(false);
    }
  };

  return (
    <BottomSheet
      isVisible={isVisible}
      onBackdropPress={onClose}
      modalProps={{
        animationType: 'slide',
      }}
    >
      <View style={[styles.container, { backgroundColor: colors.white }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text h4>{t('organizer.filterAndSort')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" type="material" color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Divider style={{ marginVertical: spacing.sm }} />

        <ScrollView style={styles.content}>
          {/* Sort Options */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.dark }]}>
              {t('organizer.sortBy')}
            </Text>
            {sortOptions.map((option) => (
              <ListItem
                key={option.value}
                onPress={() => setFilters({ ...filters, sortBy: option.value as any })}
                containerStyle={styles.listItem}
              >
                <ListItem.Content>
                  <ListItem.Title>{option.label}</ListItem.Title>
                </ListItem.Content>
                {filters.sortBy === option.value && (
                  <Icon name="check" type="material" color={colors.primary} />
                )}
              </ListItem>
            ))}
          </View>

          {/* Sort Order */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.dark }]}>
              {t('organizer.sortOrder')}
            </Text>
            <ButtonGroup
              buttons={[t('organizer.ascending'), t('organizer.descending')]}
              selectedIndex={filters.sortOrder === 'asc' ? 0 : 1}
              onPress={(index) =>
                setFilters({ ...filters, sortOrder: index === 0 ? 'asc' : 'desc' })
              }
              containerStyle={styles.buttonGroup}
              selectedButtonStyle={{ backgroundColor: colors.primary }}
            />
          </View>

          {/* Event Status Filter */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.dark }]}>
              {t('organizer.eventStatus')}
            </Text>
            {statusOptions.map((option) => (
              <CheckBox
                key={option.value}
                title={option.label}
                checked={filters.eventStatus.includes(option.value as any)}
                onPress={() => toggleStatus(option.value as any)}
                containerStyle={styles.checkbox}
                checkedColor={colors.primary}
              />
            ))}
          </View>

          {/* Date Range */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.dark }]}>
              {t('organizer.dateRange')}
            </Text>
            
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: colors.midGrey }]}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Icon name="event" type="material" color={colors.textSecondary} size={20} />
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {filters.dateRange.start
                  ? filters.dateRange.start.toLocaleDateString()
                  : t('organizer.startDate')}
              </Text>
              {filters.dateRange.start && (
                <TouchableOpacity
                  onPress={() => setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: null }
                  })}
                >
                  <Icon name="clear" type="material" color={colors.textSecondary} size={20} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateButton, { borderColor: colors.midGrey }]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Icon name="event" type="material" color={colors.textSecondary} size={20} />
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {filters.dateRange.end
                  ? filters.dateRange.end.toLocaleDateString()
                  : t('organizer.endDate')}
              </Text>
              {filters.dateRange.end && (
                <TouchableOpacity
                  onPress={() => setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: null }
                  })}
                >
                  <Icon name="clear" type="material" color={colors.textSecondary} size={20} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title={t('organizer.reset')}
            type="outline"
            onPress={handleReset}
            containerStyle={styles.actionButton}
          />
          <Button
            title={t('organizer.apply')}
            onPress={handleApply}
            containerStyle={styles.actionButton}
          />
        </View>

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={filters.dateRange.start || new Date()}
            mode="date"
            onChange={(event, date) => handleDateChange('start', date)}
          />
        )}
        {showEndDatePicker && (
          <DateTimePicker
            value={filters.dateRange.end || new Date()}
            mode="date"
            onChange={(event, date) => handleDateChange('end', date)}
          />
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  listItem: {
    paddingVertical: 12,
  },
  buttonGroup: {
    borderRadius: 8,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default DashboardFilters;