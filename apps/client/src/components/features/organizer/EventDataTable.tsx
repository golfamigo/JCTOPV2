import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  ListItem,
  Text,
  Icon,
  Badge,
  Divider,
} from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/theme';
import { EventWithStatistics } from '../../../services/dashboardAnalyticsService';

interface EventDataTableProps {
  events: EventWithStatistics[];
  onSort?: (field: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const EventDataTable: React.FC<EventDataTableProps> = ({
  events,
  onSort,
  sortBy,
  sortOrder,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();

  const handleEventPress = (eventId: string) => {
    router.push(`/organizer/events/${eventId}` as any);
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    
    return (
      <Icon
        name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'}
        type="material"
        color={colors.primary}
        size={16}
      />
    );
  };

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}萬`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}千`;
    }
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return colors.success;
      case 'draft':
        return colors.warning;
      case 'completed':
        return colors.midGrey;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        {/* Table Header */}
        <ListItem
          containerStyle={[
            styles.headerRow,
            { backgroundColor: colors.lightGrey },
          ]}
        >
          <TouchableOpacity
            style={styles.headerCell}
            onPress={() => onSort?.('name')}
          >
            <Text style={[styles.headerText, { color: colors.dark }]}>
              {t('organizer.eventName')}
            </Text>
            {renderSortIcon('name')}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.statusCell}
            onPress={() => onSort?.('status')}
          >
            <Text style={[styles.headerText, { color: colors.dark }]}>
              {t('organizer.status')}
            </Text>
            {renderSortIcon('status')}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.numberCell}
            onPress={() => onSort?.('date')}
          >
            <Text style={[styles.headerText, { color: colors.dark }]}>
              {t('organizer.date')}
            </Text>
            {renderSortIcon('date')}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.numberCell}
            onPress={() => onSort?.('registrations')}
          >
            <Text style={[styles.headerText, { color: colors.dark }]}>
              {t('organizer.registrations')}
            </Text>
            {renderSortIcon('registrations')}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.numberCell}
            onPress={() => onSort?.('attendance')}
          >
            <Text style={[styles.headerText, { color: colors.dark }]}>
              {t('organizer.attendance')}
            </Text>
            {renderSortIcon('attendance')}
          </TouchableOpacity>
        </ListItem>

        <Divider />

        {/* Table Body */}
        {events.length === 0 ? (
          <ListItem containerStyle={styles.emptyRow}>
            <ListItem.Content>
              <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                {t('organizer.noData')}
              </Text>
            </ListItem.Content>
          </ListItem>
        ) : (
          events.map((event, index) => (
            <TouchableOpacity
              key={event.id}
              onPress={() => handleEventPress(event.id)}
            >
              <ListItem
                bottomDivider={index < events.length - 1}
                containerStyle={styles.dataRow}
              >
                <View style={styles.headerCell}>
                  <Text
                    style={[styles.eventName, { color: colors.dark }]}
                    numberOfLines={1}
                  >
                    {event.title}
                  </Text>
                </View>

                <View style={styles.statusCell}>
                  <Badge
                    value={t(`organizer.${event.status}`)}
                    badgeStyle={{
                      backgroundColor: getStatusColor(event.status),
                      paddingHorizontal: spacing.xs,
                    }}
                    textStyle={{ fontSize: 12 }}
                  />
                </View>

                <View style={styles.numberCell}>
                  <Text style={[styles.dataText, { color: colors.textSecondary }]}>
                    {new Date(event.startDate).toLocaleDateString('zh-TW')}
                  </Text>
                </View>

                <View style={styles.numberCell}>
                  <Text style={[styles.dataNumber, { color: colors.primary }]}>
                    {formatNumber(event.statistics?.totalRegistrations || 0)}
                  </Text>
                </View>

                <View style={styles.numberCell}>
                  <Text
                    style={[
                      styles.dataNumber,
                      {
                        color: event.statistics
                          ? event.statistics.attendanceRate >= 70
                            ? colors.success
                            : event.statistics.attendanceRate >= 40
                            ? colors.warning
                            : colors.danger
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {event.statistics
                      ? `${event.statistics.attendanceRate.toFixed(1)}%`
                      : '-'}
                  </Text>
                </View>
              </ListItem>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  table: {
    minWidth: 600,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  emptyRow: {
    paddingVertical: 32,
  },
  headerCell: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  statusCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  numberCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  eventName: {
    fontSize: 14,
    fontWeight: '500',
  },
  dataText: {
    fontSize: 14,
  },
  dataNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default EventDataTable;