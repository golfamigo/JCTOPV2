import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { ListItem, Text, Switch, Badge, Skeleton, Button, ButtonGroup } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { DiscountCodeResponse as BaseDiscountCodeResponse } from '@jctop-event/shared-types';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

// Extend the interface to include status
interface DiscountCodeResponse extends BaseDiscountCodeResponse {
  status?: 'active' | 'inactive';
}

interface DiscountCodeManagementListProps {
  codes: DiscountCodeResponse[];
  onEdit: (code: DiscountCodeResponse) => void;
  onDelete: (code: DiscountCodeResponse) => void;
  onToggleActive: (code: DiscountCodeResponse) => void;
  loading?: boolean;
}

type SortField = 'code' | 'usageCount' | 'expiresAt' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function DiscountCodeManagementList({
  codes,
  onEdit,
  onDelete,
  onToggleActive,
  loading = false,
}: DiscountCodeManagementListProps) {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const borderRadius = 8;
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterIndex, setFilterIndex] = useState(0); // 0: All, 1: Active, 2: Inactive

  // Format currency in TWD
  const formatCurrency = (amount: number) => {
    return `NT$ ${amount.toLocaleString('zh-TW')}`;
  };

  // Format discount value
  const formatDiscountValue = (type: string, value: number) => {
    if (type === 'percentage') {
      return `${value}%`;
    }
    return formatCurrency(value);
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return t('discounts.noExpiry');
    try {
      return format(new Date(date), 'yyyy年MM月dd日', { locale: zhTW });
    } catch {
      return '-';
    }
  };

  // Filter codes
  const filteredCodes = useMemo(() => {
    let filtered = [...codes];
    
    // Apply filter
    if (filterIndex === 1) {
      filtered = filtered.filter(code => code.status === 'active');
    } else if (filterIndex === 2) {
      filtered = filtered.filter(code => code.status === 'inactive' || !code.status);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'expiresAt') {
        aVal = aVal ? new Date(aVal).getTime() : Number.MAX_SAFE_INTEGER;
        bVal = bVal ? new Date(bVal).getTime() : Number.MAX_SAFE_INTEGER;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [codes, filterIndex, sortField, sortOrder]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <View style={styles.container}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.skeletonCard, { marginBottom: spacing.md }]}>
            <Skeleton animation="pulse" height={80} />
          </View>
        ))}
      </View>
    );
  }

  // Empty state
  if (codes.length === 0) {
    return (
      <View style={[styles.emptyContainer, { paddingVertical: spacing.xl }]}>
        <MaterialCommunityIcons
          name="tag-off"
          size={64}
          color={colors.grey2}
        />
        <Text style={[styles.emptyText, { color: colors.grey3, marginTop: spacing.md }]}>
          {t('discounts.noData')}
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.grey3, marginTop: spacing.xs }]}>
          {t('discounts.createFirst')}
        </Text>
      </View>
    );
  }

  // Render discount code item
  const renderItem = ({ item }: { item: DiscountCodeResponse }) => {
    const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date();

    return (
      <ListItem.Swipeable
        testID={`discount-item-${item.id}`}
        bottomDivider
        containerStyle={[
          styles.listItem,
          { backgroundColor: colors.white },
          item.status === 'inactive' && styles.inactiveItem,
        ]}
        leftContent={(reset) => (
          <Button
            title={t('common.edit')}
            onPress={() => {
              reset();
              onEdit(item);
            }}
            icon={{ name: 'edit', type: 'material', color: 'white' }}
            buttonStyle={{ minHeight: '100%', backgroundColor: colors.primary }}
          />
        )}
        rightContent={(reset) => (
          <Button
            title={t('common.delete')}
            onPress={() => {
              reset();
              onDelete(item);
            }}
            icon={{ name: 'delete', type: 'material', color: 'white' }}
            buttonStyle={{ minHeight: '100%', backgroundColor: colors.error }}
          />
        )}
      >
        <View style={styles.codeContainer}>
          <View style={styles.codeHeader}>
            <Text style={[styles.codeText, { color: colors.dark }]}>
              {item.code}
            </Text>
            <Switch
              value={item.status === 'active'}
              onValueChange={() => onToggleActive(item)}
              color={colors.primary}
            />
          </View>

          <View style={styles.codeDetails}>
            <Badge
              value={formatDiscountValue(item.type, item.value)}
              badgeStyle={[
                styles.badge,
                { backgroundColor: item.type === 'percentage' ? colors.success : colors.warning }
              ]}
              textStyle={styles.badgeText}
            />
            
            <View style={styles.usageContainer}>
              <MaterialCommunityIcons name="account-check" size={16} color={colors.grey3} />
              <Text style={[styles.usageText, { color: colors.grey3 }]}>
                {t('discounts.usageCount')}: {item.usageCount}
              </Text>
            </View>

            {item.expiresAt && (
              <View style={styles.expiryContainer}>
                <MaterialCommunityIcons 
                  name="calendar-clock" 
                  size={16} 
                  color={isExpired ? colors.error : colors.grey3} 
                />
                <Text style={[
                  styles.expiryText, 
                  { color: isExpired ? colors.error : colors.grey3 }
                ]}>
                  {formatDate(item.expiresAt)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ListItem.Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter buttons */}
      <View style={[styles.filterContainer, { paddingHorizontal: spacing.md }]}>
        <ButtonGroup
          buttons={[t('common.all'), t('discounts.active'), t('discounts.inactive')]}
          selectedIndex={filterIndex}
          onPress={setFilterIndex}
          containerStyle={[
            styles.filterButtons,
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

      {/* Sort options */}
      <View style={[styles.sortContainer, { paddingHorizontal: spacing.md }]}>
        <Text style={[styles.sortLabel, { color: colors.grey3 }]}>
          {t('common.sortBy')}:
        </Text>
        <View style={styles.sortButtons}>
          {[
            { field: 'code' as SortField, label: t('discounts.code') },
            { field: 'usageCount' as SortField, label: t('discounts.usageCount') },
            { field: 'expiresAt' as SortField, label: t('discounts.expiresAt') },
          ].map((option) => (
            <Button
              key={option.field}
              title={option.label}
              type={sortField === option.field ? 'solid' : 'outline'}
              size="sm"
              onPress={() => handleSort(option.field)}
              buttonStyle={[
                styles.sortButton,
                sortField === option.field && { backgroundColor: colors.primary }
              ]}
              titleStyle={[
                styles.sortButtonText,
                sortField === option.field ? { color: colors.white } : { color: colors.primary }
              ]}
              icon={
                sortField === option.field ? (
                  <MaterialCommunityIcons
                    name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                    size={16}
                    color={colors.white}
                    style={{ marginLeft: 4 }}
                  />
                ) : undefined
              }
              iconRight
            />
          ))}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredCodes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    paddingVertical: 8,
  },
  filterButtons: {
    height: 40,
    borderWidth: 1,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sortLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    minHeight: 32,
  },
  sortButtonText: {
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 100,
  },
  listItem: {
    paddingVertical: 12,
  },
  inactiveItem: {
    opacity: 0.6,
  },
  codeContainer: {
    flex: 1,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  codeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  usageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  usageText: {
    fontSize: 14,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expiryText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  skeletonCard: {
    paddingHorizontal: 16,
  },
});