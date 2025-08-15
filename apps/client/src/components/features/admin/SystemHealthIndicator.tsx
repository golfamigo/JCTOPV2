import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ListItem, Badge, Text, Icon, LinearProgress } from '@rneui/themed';
import { useAppTheme } from '@/theme';

interface HealthIndicatorProps {
  title: string;
  status: 'healthy' | 'warning' | 'critical';
  metric?: {
    value: number;
    max?: number;
    unit?: string;
  };
  details?: string;
  icon: string;
}

export default function SystemHealthIndicator({
  title,
  status,
  metric,
  details,
  icon,
}: HealthIndicatorProps) {
  const { colors } = useAppTheme();

  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'critical':
        return colors.danger;
      default:
        return colors.grey3;
    }
  };

  const getProgressColor = () => {
    if (!metric) return colors.primary;
    const percentage = metric.max ? (metric.value / metric.max) * 100 : metric.value;
    if (percentage < 60) return colors.success;
    if (percentage < 80) return colors.warning;
    return colors.danger;
  };

  return (
    <ListItem bottomDivider containerStyle={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${getStatusColor()}15` }]}>
        <Icon
          name={icon}
          type="material-community"
          size={24}
          color={getStatusColor()}
        />
      </View>
      
      <ListItem.Content>
        <View style={styles.header}>
          <ListItem.Title style={styles.title}>{title}</ListItem.Title>
          <Badge
            value={status}
            badgeStyle={[styles.badge, { backgroundColor: getStatusColor() }]}
            textStyle={styles.badgeText}
          />
        </View>
        
        {metric && (
          <View style={styles.metricContainer}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricValue}>
                {metric.value}{metric.unit || ''}
                {metric.max && ` / ${metric.max}${metric.unit || ''}`}
              </Text>
              {metric.max && (
                <Text style={[styles.percentage, { color: getProgressColor() }]}>
                  {Math.round((metric.value / metric.max) * 100)}%
                </Text>
              )}
            </View>
            {metric.max && (
              <LinearProgress
                value={metric.value / metric.max}
                color={getProgressColor()}
                trackColor={colors.greyOutline}
                style={styles.progress}
                variant="determinate"
              />
            )}
          </View>
        )}
        
        {details && (
          <Text style={styles.details}>{details}</Text>
        )}
      </ListItem.Content>
    </ListItem>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricContainer: {
    marginTop: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  percentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  progress: {
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  details: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});