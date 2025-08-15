import React, { useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { ListItem, Text, Avatar, Badge } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface Transaction {
  id: string;
  date: string;
  type: 'revenue' | 'expense' | 'refund';
  description: string;
  amount: number;
  paymentMethod?: string;
  attendeeName?: string;
  ticketType?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionPress?: (transaction: Transaction) => void;
  onLoadMore?: () => void;
  loading?: boolean;
  ListHeaderComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onTransactionPress,
  onLoadMore,
  loading = false,
  ListHeaderComponent,
  ListEmptyComponent,
}) => {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();

  // Format currency in TWD
  const formatCurrency = useCallback((amount: number) => {
    return `NT$ ${amount.toLocaleString('zh-TW')}`;
  }, []);

  // Format date for zh-TW locale
  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MM月dd日 HH:mm', { locale: zhTW });
    } catch {
      return dateString;
    }
  }, []);

  // Get icon and color based on transaction type
  const getTransactionIcon = useCallback((type: Transaction['type']) => {
    switch (type) {
      case 'revenue':
        return { name: 'cash-plus', color: colors.success };
      case 'expense':
        return { name: 'cash-minus', color: colors.error };
      case 'refund':
        return { name: 'cash-refund', color: colors.warning };
      default:
        return { name: 'cash', color: colors.grey3 };
    }
  }, [colors]);

  // Get status badge
  const getStatusBadge = useCallback((status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return { label: '完成', color: colors.success };
      case 'pending':
        return { label: '待處理', color: colors.warning };
      case 'failed':
        return { label: '失敗', color: colors.error };
      default:
        return { label: status, color: colors.grey3 };
    }
  }, [colors]);

  // Handle swipe actions
  const handleSwipeRight = useCallback((transaction: Transaction) => {
    Alert.alert(
      t('organizer.reports.transactionDetails'),
      `${transaction.description}\n${formatCurrency(transaction.amount)}`,
      [
        { text: t('common.close'), style: 'cancel' },
        { 
          text: t('common.view'), 
          onPress: () => onTransactionPress?.(transaction) 
        },
      ]
    );
  }, [t, formatCurrency, onTransactionPress]);

  // Render individual transaction item
  const renderTransaction = useCallback(({ item }: { item: Transaction }) => {
    const icon = getTransactionIcon(item.type);
    const status = getStatusBadge(item.status);
    const amountColor = item.type === 'revenue' ? colors.success : 
                        item.type === 'expense' ? colors.error : 
                        colors.warning;

    return (
      <ListItem.Swipeable
        onPress={() => onTransactionPress?.(item)}
        rightContent={(reset) => (
          <View style={styles.swipeAction}>
            <MaterialCommunityIcons
              name="information-outline"
              size={24}
              color={colors.white}
            />
            <Text style={[styles.swipeText, { color: colors.white }]}>
              {t('common.details')}
            </Text>
          </View>
        )}
        rightStyle={{ backgroundColor: colors.primary }}
        bottomDivider
        containerStyle={[styles.listItem, { backgroundColor: colors.white }]}
      >
        <Avatar
          rounded
          icon={{ 
            name: icon.name, 
            type: 'material-community',
            color: colors.white 
          }}
          containerStyle={{ backgroundColor: icon.color }}
        />
        
        <ListItem.Content>
          <View style={styles.titleRow}>
            <ListItem.Title style={[styles.title, { color: colors.dark }]}>
              {item.description}
            </ListItem.Title>
            <Badge
              value={status.label}
              badgeStyle={{ backgroundColor: status.color }}
              textStyle={{ fontSize: 10 }}
            />
          </View>
          
          <View style={styles.subtitleRow}>
            <ListItem.Subtitle style={[styles.subtitle, { color: colors.grey3 }]}>
              {formatDate(item.date)}
            </ListItem.Subtitle>
            {item.paymentMethod && (
              <ListItem.Subtitle style={[styles.subtitle, { color: colors.grey3 }]}>
                {' • '}{item.paymentMethod}
              </ListItem.Subtitle>
            )}
          </View>
          
          {item.attendeeName && (
            <ListItem.Subtitle style={[styles.attendee, { color: colors.grey3 }]}>
              {item.attendeeName}
              {item.ticketType && ` - ${item.ticketType}`}
            </ListItem.Subtitle>
          )}
        </ListItem.Content>
        
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
          </Text>
        </View>
      </ListItem.Swipeable>
    );
  }, [
    getTransactionIcon, 
    getStatusBadge, 
    colors, 
    onTransactionPress, 
    handleSwipeRight,
    formatCurrency,
    formatDate,
    t
  ]);

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  // Empty state component
  const EmptyComponent = useMemo(() => {
    if (ListEmptyComponent) return ListEmptyComponent;
    
    return (
      <View style={[styles.emptyContainer, { paddingVertical: spacing.xl }]}>
        <MaterialCommunityIcons
          name="cash-remove"
          size={64}
          color={colors.grey2}
        />
        <Text style={[styles.emptyText, { color: colors.grey3 }]}>
          {t('organizer.reports.noData')}
        </Text>
      </View>
    );
  }, [ListEmptyComponent, colors, spacing, t]);

  return (
    <FlatList
      testID="flat-list"
      data={transactions}
      renderItem={renderTransaction}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={EmptyComponent}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      refreshing={loading}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={transactions.length === 0 ? styles.emptyList : undefined}
    />
  );
};

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
  },
  attendee: {
    fontSize: 13,
    marginTop: 4,
  },
  amountContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    minWidth: 100,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  swipeAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  swipeText: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
});

export default TransactionList;