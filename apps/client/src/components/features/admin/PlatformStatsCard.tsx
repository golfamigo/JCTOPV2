import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Icon } from '@rneui/themed';
import { useAppTheme } from '@/theme';

interface PlatformStatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export default function PlatformStatsCard({
  title,
  value,
  icon,
  iconColor,
  trend,
  subtitle,
}: PlatformStatsCardProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <Card containerStyle={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor ? `${iconColor}15` : `${colors.primary}15` }]}>
          <Icon
            testID="stats-card-icon"
            name={icon}
            type="material-community"
            size={24}
            color={iconColor || colors.primary}
          />
        </View>
        {trend && (
          <View style={styles.trendContainer}>
            <Icon
              testID="trend-icon"
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              type="material-community"
              size={16}
              color={trend.isPositive ? colors.success : colors.danger}
            />
            <Text style={[
              styles.trendText,
              { color: trend.isPositive ? colors.success : colors.danger }
            ]}>
              {trend.value}%
            </Text>
          </View>
        )}
      </View>
      
      <Text style={styles.value}>{value}</Text>
      <Text style={[styles.title, { color: colors.grey3 }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.grey4 }]}>{subtitle}</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
});