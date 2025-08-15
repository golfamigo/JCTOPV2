import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { DiscountCodeResponse as BaseDiscountCodeResponse } from '@jctop-event/shared-types';

interface DiscountCodeResponse extends BaseDiscountCodeResponse {
  status?: 'active' | 'inactive';
}

interface DiscountCodeStatisticsProps {
  codes: DiscountCodeResponse[];
}

export default function DiscountCodeStatistics({ codes }: DiscountCodeStatisticsProps) {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const borderRadius = 8;

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalCodes = codes.length;
    const activeCodes = codes.filter(code => code.status === 'active').length;
    const totalUsage = codes.reduce((sum, code) => sum + code.usageCount, 0);
    
    // Calculate revenue impact (estimated based on discount values and usage)
    const revenueImpact = codes.reduce((sum, code) => {
      const impact = code.type === 'percentage' 
        ? (code.value / 100) * code.usageCount * 1000 // Assume avg order of 1000 for percentage
        : code.value * code.usageCount; // Direct impact for fixed amount
      return sum + impact;
    }, 0);

    return {
      totalCodes,
      activeCodes,
      totalUsage,
      revenueImpact,
    };
  }, [codes]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return `NT$ ${amount.toLocaleString('zh-TW')}`;
  };

  // Statistics cards data
  const statsCards = [
    {
      title: t('discounts.statistics.totalCodes'),
      value: statistics.totalCodes.toString(),
      icon: 'tag-multiple',
      color: colors.primary,
    },
    {
      title: t('discounts.statistics.activeCodes'),
      value: statistics.activeCodes.toString(),
      icon: 'tag-check',
      color: colors.success,
    },
    {
      title: t('discounts.statistics.totalUsage'),
      value: statistics.totalUsage.toString(),
      icon: 'account-group',
      color: colors.warning,
    },
    {
      title: t('discounts.statistics.revenueImpact'),
      value: formatCurrency(statistics.revenueImpact),
      icon: 'cash',
      color: colors.error,
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, { paddingHorizontal: spacing.md }]}
    >
      {statsCards.map((stat, index) => (
        <Card
          key={index}
          containerStyle={[
            styles.card,
            { 
              backgroundColor: colors.white,
              borderRadius: borderRadius,
              marginRight: index < statsCards.length - 1 ? spacing.sm : 0,
            }
          ]}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: `${stat.color}15` }]}>
              <MaterialCommunityIcons
                name={stat.icon as any}
                size={24}
                color={stat.color}
              />
            </View>
            <Text style={[styles.title, { color: colors.grey3 }]}>
              {stat.title}
            </Text>
            <Text style={[styles.value, { color: colors.dark }]}>
              {stat.value}
            </Text>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  card: {
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
  },
  cardContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});