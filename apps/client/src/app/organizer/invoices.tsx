import React, { useState, useEffect } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, Alert } from 'react-native';
import { 
  Card, 
  Text, 
  ListItem, 
  Badge, 
  SearchBar, 
  Button,
  ButtonGroup,
  Icon,
  Skeleton
} from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '@/theme';

// Types for invoice data (extending existing types as needed)
interface Invoice {
  id: string;
  invoiceNumber: string;
  eventId: string;
  eventName: string;
  recipientEmail: string;
  recipientName: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: string;
  sentAt?: string;
  paidAt?: string;
  dueDate: string;
}

interface InvoiceListProps {
  eventId?: string;
}

const InvoiceListScreen: React.FC<InvoiceListProps> = ({ eventId }) => {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(0); // 0 = All, 1 = Draft, 2 = Sent, etc.
  const [error, setError] = useState<string | null>(null);

  const statusFilters = [
    { key: 'all', label: t('common.all') },
    { key: 'draft', label: t('invoice.draft') },
    { key: 'sent', label: t('invoice.sent') },
    { key: 'paid', label: t('invoice.paid') },
    { key: 'overdue', label: t('invoice.overdue') },
    { key: 'cancelled', label: t('invoice.cancelled') },
  ];

  // Mock data for development - replace with actual service calls
  const mockInvoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-001',
      eventId: params.eventId as string || eventId || '',
      eventName: 'Tech Conference 2024',
      recipientEmail: 'john@example.com',
      recipientName: 'John Doe',
      amount: 1500,
      status: 'sent',
      createdAt: '2024-01-10T10:00:00Z',
      sentAt: '2024-01-10T11:00:00Z',
      dueDate: '2024-02-10T00:00:00Z',
    },
    {
      id: '2',
      invoiceNumber: 'INV-002',
      eventId: params.eventId as string || eventId || '',
      eventName: 'Marketing Workshop',
      recipientEmail: 'jane@example.com',
      recipientName: 'Jane Smith',
      amount: 800,
      status: 'paid',
      createdAt: '2024-01-08T14:30:00Z',
      sentAt: '2024-01-08T15:00:00Z',
      paidAt: '2024-01-15T09:20:00Z',
      dueDate: '2024-02-08T00:00:00Z',
    },
    {
      id: '3',
      invoiceNumber: 'INV-003',
      eventId: params.eventId as string || eventId || '',
      eventName: 'Design Bootcamp',
      recipientEmail: 'bob@example.com',
      recipientName: 'Bob Johnson',
      amount: 2200,
      status: 'overdue',
      createdAt: '2023-12-15T16:45:00Z',
      sentAt: '2023-12-15T17:00:00Z',
      dueDate: '2024-01-15T00:00:00Z',
    },
    {
      id: '4',
      invoiceNumber: 'INV-004',
      eventId: params.eventId as string || eventId || '',
      eventName: 'Leadership Summit',
      recipientEmail: 'alice@example.com',
      recipientName: 'Alice Brown',
      amount: 950,
      status: 'draft',
      createdAt: '2024-01-12T08:15:00Z',
      dueDate: '2024-02-12T00:00:00Z',
    },
  ];

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Replace with actual service call:
      // const data = await invoiceService.getInvoices(eventId);
      setInvoices(mockInvoices);
    } catch (err: any) {
      setError(err.message || t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInvoices();
    setRefreshing(false);
  };

  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'draft':
        return { value: t('invoice.draft'), status: 'warning' as const };
      case 'sent':
        return { value: t('invoice.sent'), status: 'primary' as const };
      case 'paid':
        return { value: t('invoice.paid'), status: 'success' as const };
      case 'overdue':
        return { value: t('invoice.overdue'), status: 'error' as const };
      case 'cancelled':
        return { value: t('invoice.cancelled'), status: 'warning' as const };
      default:
        return { value: status, status: 'primary' as const };
    }
  };

  const getFilteredInvoices = () => {
    let filtered = invoices;

    // Filter by status
    if (selectedStatus > 0) {
      const statusKey = statusFilters[selectedStatus].key;
      filtered = filtered.filter(invoice => invoice.status === statusKey);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.recipientName.toLowerCase().includes(query) ||
        invoice.recipientEmail.toLowerCase().includes(query) ||
        invoice.eventName.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleInvoicePress = (invoice: Invoice) => {
    router.push(`/organizer/invoices/${invoice.id}`);
  };

  const handleCreateInvoice = () => {
    router.push(`/organizer/invoices/create`);
  };

  const handleSendInvoice = (invoice: Invoice) => {
    Alert.alert(
      t('invoice.sendInvoice'),
      t('invoice.confirmSend', { number: invoice.invoiceNumber }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('invoice.sendInvoice'), 
          onPress: async () => {
            try {
              // Replace with actual service call:
              // await invoiceService.sendInvoice(invoice.id);
              Alert.alert(t('common.success'), t('invoice.invoiceSent'));
              loadInvoices(); // Reload to get updated status
            } catch (err: any) {
              Alert.alert(t('common.error'), err.message || t('invoice.sendFailed'));
            }
          }
        },
      ]
    );
  };

  const renderInvoiceItem = ({ item }: { item: Invoice }) => {
    const badgeProps = getStatusBadgeProps(item.status);
    
    return (
      <ListItem 
        onPress={() => handleInvoicePress(item)}
        containerStyle={styles.listItem}
        pad={spacing.md}
      >
        <ListItem.Content>
          <View style={styles.listItemHeader}>
            <View style={styles.invoiceNumberContainer}>
              <Text style={[typography.h4, { color: colors.primary }]}>
                {item.invoiceNumber}
              </Text>
              <Badge {...badgeProps} badgeStyle={styles.statusBadge} />
            </View>
            <Text style={[typography.small, { color: colors.grey2 }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          
          <View style={styles.listItemDetails}>
            <View style={styles.recipientInfo}>
              <Text style={typography.body}>{item.recipientName}</Text>
              <Text style={[typography.small, { color: colors.grey2 }]}>
                {item.recipientEmail}
              </Text>
              <Text style={[typography.small, { color: colors.grey2 }]}>
                {item.eventName}
              </Text>
            </View>
            
            <View style={styles.amountContainer}>
              <Text style={[typography.h4, { color: colors.primary }]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          </View>

          {item.status === 'draft' && (
            <View style={styles.actionButtons}>
              <Button
                title={t('invoice.sendInvoice')}
                type="outline"
                size="sm"
                onPress={() => handleSendInvoice(item)}
                buttonStyle={styles.sendButton}
                titleStyle={styles.sendButtonText}
              />
            </View>
          )}
        </ListItem.Content>
        
        <Icon
          name="chevron-right"
          type="material-community"
          color={colors.grey2}
          size={20}
        />
      </ListItem>
    );
  };

  const renderEmptyState = () => (
    <Card containerStyle={styles.emptyStateCard}>
      <Icon
        name="file-document-multiple-outline"
        type="material-community"
        size={64}
        color={colors.grey2}
        style={{ alignSelf: 'center', marginBottom: spacing.md }}
      />
      <Text style={[typography.h3, styles.emptyStateTitle]}>
        {t('invoice.noInvoices')}
      </Text>
      <Text style={[typography.body, styles.emptyStateDescription, { color: colors.grey2 }]}>
        {t('invoice.noInvoicesDescription')}
      </Text>
      <Button
        title={t('invoice.createInvoice')}
        onPress={handleCreateInvoice}
        buttonStyle={styles.createButton}
        containerStyle={styles.createButtonContainer}
      />
    </Card>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      {[...Array(5)].map((_, index) => (
        <Card key={index} containerStyle={styles.skeletonCard}>
          <View style={styles.skeletonHeader}>
            <Skeleton animation="pulse" width={120} height={20} style={styles.skeletonItem} />
            <Skeleton animation="pulse" width={60} height={20} style={styles.skeletonItem} />
          </View>
          <Skeleton animation="pulse" width={200} height={16} style={styles.skeletonItem} />
          <Skeleton animation="pulse" width={160} height={16} style={styles.skeletonItem} />
          <Skeleton animation="pulse" width={120} height={16} />
        </Card>
      ))}
    </View>
  );

  const filteredInvoices = getFilteredInvoices();

  if (error) {
    return (
      <View style={styles.container}>
        <Card containerStyle={styles.errorCard}>
          <Icon
            name="alert-circle-outline"
            type="material-community"
            size={48}
            color={colors.error}
            style={{ alignSelf: 'center', marginBottom: spacing.md }}
          />
          <Text style={[typography.h3, styles.errorTitle]}>
            {t('common.error')}
          </Text>
          <Text style={[typography.body, styles.errorDescription, { color: colors.grey2 }]}>
            {error}
          </Text>
          <Button
            title={t('common.retry')}
            onPress={loadInvoices}
            buttonStyle={styles.retryButton}
            containerStyle={styles.retryButtonContainer}
          />
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text h1 style={styles.title}>
          {t('invoice.invoiceManagement')}
        </Text>
        <Button
          title={t('invoice.createInvoice')}
          onPress={handleCreateInvoice}
          icon={
            <MaterialCommunityIcons 
              name="plus" 
              size={20} 
              color={colors.white} 
              style={{ marginRight: spacing.xs }}
            />
          }
          buttonStyle={styles.createHeaderButton}
        />
      </View>

      {/* Search Bar */}
      <SearchBar
        placeholder={t('invoice.searchInvoices')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        inputStyle={styles.searchInput}
        searchIcon={{ color: colors.grey2 }}
        clearIcon={{ color: colors.grey2 }}
        showCancel={false}
      />

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <Text style={[typography.body, styles.filterLabel]}>
          {t('invoice.filterByStatus')}:
        </Text>
        <ButtonGroup
          buttons={statusFilters.map(filter => filter.label)}
          selectedIndex={selectedStatus}
          onPress={setSelectedStatus}
          containerStyle={styles.filterButtonGroup}
          selectedButtonStyle={{ backgroundColor: colors.primary }}
          textStyle={{ color: colors.grey2, fontSize: 12 }}
          selectedTextStyle={{ color: colors.white }}
        />
      </View>

      {/* Invoice List */}
      {loading ? (
        renderLoadingState()
      ) : filteredInvoices.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredInvoices}
          renderItem={renderInvoiceItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24, // spacing.lg
    paddingVertical: 16, // spacing.md
    backgroundColor: '#FFFFFF', // colors.white
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF', // colors.border
  },
  title: {
    flex: 1,
  },
  createHeaderButton: {
    backgroundColor: '#007BFF', // colors.primary
    borderRadius: 8,
    paddingHorizontal: 16, // spacing.md
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 24, // spacing.lg
  },
  searchInputContainer: {
    backgroundColor: '#FFFFFF', // colors.white
    borderRadius: 8,
  },
  searchInput: {
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 24, // spacing.lg
    paddingVertical: 8, // spacing.sm
  },
  filterLabel: {
    marginBottom: 8, // spacing.sm
    fontWeight: '600',
  },
  filterButtonGroup: {
    marginLeft: 0,
    marginRight: 0,
    borderRadius: 8,
  },
  list: {
    flex: 1,
    paddingHorizontal: 24, // spacing.lg
  },
  listItem: {
    backgroundColor: '#FFFFFF', // colors.white
    borderRadius: 8,
    marginVertical: 4, // spacing.xs
    shadowColor: '#212529', // colors.dark
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // spacing.sm
  },
  invoiceNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    marginLeft: 8, // spacing.sm
  },
  listItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recipientInfo: {
    flex: 1,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16, // spacing.md
    justifyContent: 'flex-end',
  },
  sendButton: {
    borderColor: '#007BFF', // colors.primary
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  sendButtonText: {
    color: '#007BFF', // colors.primary
    fontSize: 14,
  },
  separator: {
    height: 8, // spacing.sm
  },
  emptyStateCard: {
    margin: 24, // spacing.lg
    padding: 32, // spacing.xl
    alignItems: 'center',
    borderRadius: 12,
  },
  emptyStateTitle: {
    textAlign: 'center',
    marginBottom: 8, // spacing.sm
  },
  emptyStateDescription: {
    textAlign: 'center',
    marginBottom: 24, // spacing.lg
  },
  createButton: {
    backgroundColor: '#007BFF', // colors.primary
    borderRadius: 8,
    paddingHorizontal: 24, // spacing.lg
  },
  createButtonContainer: {
    width: '100%',
  },
  loadingContainer: {
    padding: 24, // spacing.lg
  },
  skeletonCard: {
    padding: 16, // spacing.md
    marginBottom: 8, // spacing.sm
    borderRadius: 8,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // spacing.sm
  },
  skeletonItem: {
    marginBottom: 8, // spacing.sm
  },
  errorCard: {
    margin: 24, // spacing.lg
    padding: 32, // spacing.xl
    alignItems: 'center',
    borderRadius: 12,
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: 8, // spacing.sm
  },
  errorDescription: {
    textAlign: 'center',
    marginBottom: 24, // spacing.lg
  },
  retryButton: {
    backgroundColor: '#007BFF', // colors.primary
    borderRadius: 8,
    paddingHorizontal: 24, // spacing.lg
  },
  retryButtonContainer: {
    width: '100%',
  },
});

export default InvoiceListScreen;