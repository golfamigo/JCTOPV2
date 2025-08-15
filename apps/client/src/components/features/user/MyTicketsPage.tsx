import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Button,
  Text,
  Card,
  Image,
  Divider,
  Icon,
  Badge,
  SearchBar,
  ButtonGroup,
  Overlay,
} from '@rneui/themed';
import { Registration } from '@jctop-event/shared-types';
import registrationService from '../../../services/registrationService';
import { QRCodeModal } from './QRCodeModal';
import { useAppTheme } from '../../../theme';

interface MyTicketsPageProps {}

const MyTicketsPage: React.FC<MyTicketsPageProps> = () => {
  const router = useRouter();
  const { colors, spacing } = useAppTheme();
  
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'event'>('date');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);

  const statusOptions = ['all', 'paid', 'pending', 'cancelled'];
  const statusLabels = ['全部', '已付款', '待付款', '已取消'];

  useEffect(() => {
    loadRegistrations();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [searchQuery, selectedStatus, sortBy, registrations]);

  const loadRegistrations = async () => {
    try {
      setError(null);
      const data = await registrationService.getUserRegistrations();
      setRegistrations(data);
      setFilteredRegistrations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets');
      Alert.alert('錯誤', '無法載入票券資訊');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRegistrations();
  };

  const filterRegistrations = () => {
    let filtered = [...registrations];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(r => r.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        (r as any).eventTitle?.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      filtered.sort((a, b) => 
        ((a as any).eventTitle || '').localeCompare((b as any).eventTitle || '')
      );
    }

    setFilteredRegistrations(filtered);
  };

  const handleViewTicket = (registration: Registration) => {
    setSelectedRegistration(registration);
    setShowQRModal(true);
  };

  const handleViewEventDetails = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  const handleContactSupport = (registrationId: string) => {
    Alert.alert(
      '聯絡客服',
      `關於訂單 ${registrationId}`,
      [
        { text: '取消', style: 'cancel' },
        { text: '發送郵件', onPress: () => {
          // Open email client
        }}
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#48BB78';
      case 'pending': return '#ED8936';
      case 'cancelled': return '#E53E3E';
      case 'checkedIn': return '#3182CE';
      default: return '#718096';
    }
  };

  const renderTicketCard = (registration: Registration) => {
    const totalTickets = registrationService.calculateTotalTickets(registration.ticketSelections);
    
    return (
      <Card key={registration.id} containerStyle={styles.ticketCard}>
        <TouchableOpacity
          onPress={() => handleViewTicket(registration)}
          activeOpacity={0.7}
        >
          <View style={styles.ticketHeader}>
            <View style={styles.ticketHeaderLeft}>
              <Text style={styles.eventTitle}>
                {(registration as any).eventTitle || 'Event'}
              </Text>
              <Text style={styles.eventDate}>
                {new Date((registration as any).eventDate || registration.createdAt).toLocaleDateString('zh-TW')}
              </Text>
            </View>
            <Badge
              value={registrationService.formatRegistrationStatus(registration.status)}
              badgeStyle={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(registration.status) }
              ]}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.ticketBody}>
            <View style={styles.ticketInfo}>
              <Icon name="confirmation-number" type="material" size={16} color={colors.grey3} />
              <Text style={styles.ticketInfoText}>
                {registrationService.formatTicketSummary(registration.ticketSelections)}
              </Text>
            </View>
            
            <View style={styles.ticketInfo}>
              <Icon name="receipt" type="material" size={16} color={colors.grey3} />
              <Text style={styles.ticketInfoText}>
                訂單編號: {registration.id.slice(0, 8).toUpperCase()}
              </Text>
            </View>

            <View style={styles.ticketInfo}>
              <Icon name="attach-money" type="material" size={16} color={colors.grey3} />
              <Text style={styles.ticketInfoText}>
                總金額: ${registration.finalAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.ticketActions}>
            <Button
              title="查看票券"
              type="clear"
              titleStyle={styles.actionButtonText}
              icon={
                <Icon
                  name="qr-code"
                  type="material"
                  size={18}
                  color={colors.primary}
                  style={{ marginRight: 4 }}
                />
              }
              onPress={() => handleViewTicket(registration)}
            />
            
            <Button
              title="活動詳情"
              type="clear"
              titleStyle={styles.actionButtonText}
              icon={
                <Icon
                  name="info"
                  type="material"
                  size={18}
                  color={colors.grey3}
                  style={{ marginRight: 4 }}
                />
              }
              onPress={() => handleViewEventDetails(registration.eventId)}
            />

            {registration.status === 'pending' && (
              <Button
                title="繼續付款"
                type="clear"
                titleStyle={[styles.actionButtonText, { color: colors.warning }]}
                icon={
                  <Icon
                    name="payment"
                    type="material"
                    size={18}
                    color={colors.warning}
                    style={{ marginRight: 4 }}
                  />
                }
                onPress={() => router.push(`/payment/${registration.id}` as any)}
              />
            )}
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>載入票券中...</Text>
      </View>
    );
  }

  if (error && !registrations.length) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error" type="material" color={colors.error} size={48} />
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="重試"
          onPress={loadRegistrations}
          buttonStyle={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text h4 style={styles.headerTitle}>我的票券</Text>
        <TouchableOpacity
          onPress={() => setFilterMenuVisible(true)}
          style={styles.filterButton}
        >
          <Icon name="filter-list" type="material" size={24} color={colors.grey1} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <SearchBar
        placeholder="搜尋活動或訂單編號..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        lightTheme
        round
      />

      {/* Status Filter */}
      <ButtonGroup
        onPress={(index) => setSelectedStatus(statusOptions[index])}
        selectedIndex={statusOptions.indexOf(selectedStatus)}
        buttons={statusLabels}
        containerStyle={styles.statusFilter}
        selectedButtonStyle={styles.selectedStatusButton}
      />

      {/* Tickets List */}
      <ScrollView
        style={styles.ticketsList}
        contentContainerStyle={styles.ticketsListContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {filteredRegistrations.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name="confirmation-number"
              type="material"
              size={64}
              color={colors.grey4}
            />
            <Text style={styles.emptyStateTitle}>沒有找到票券</Text>
            <Text style={styles.emptyStateDescription}>
              {searchQuery || selectedStatus !== 'all' 
                ? '嘗試調整搜尋條件或篩選器'
                : '您還沒有購買任何活動票券'}
            </Text>
            {(!searchQuery && selectedStatus === 'all') && (
              <Button
                title="瀏覽活動"
                onPress={() => router.push('/events')}
                buttonStyle={styles.browseButton}
              />
            )}
          </View>
        ) : (
          filteredRegistrations.map(renderTicketCard)
        )}
      </ScrollView>

      {/* QR Code Modal */}
      {selectedRegistration && (
        <QRCodeModal
          visible={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedRegistration(null);
          }}
          registration={selectedRegistration}
        />
      )}

      {/* Filter Menu Overlay */}
      <Overlay
        isVisible={filterMenuVisible}
        onBackdropPress={() => setFilterMenuVisible(false)}
        overlayStyle={styles.filterOverlay}
      >
        <View>
          <Text h4 style={styles.filterTitle}>排序方式</Text>
          <TouchableOpacity
            style={styles.filterOption}
            onPress={() => {
              setSortBy('date');
              setFilterMenuVisible(false);
            }}
          >
            <Text style={styles.filterOptionText}>購買日期</Text>
            {sortBy === 'date' && (
              <Icon name="check" type="material" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterOption}
            onPress={() => {
              setSortBy('event');
              setFilterMenuVisible(false);
            }}
          >
            <Text style={styles.filterOptionText}>活動名稱</Text>
            {sortBy === 'event' && (
              <Icon name="check" type="material" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </Overlay>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    backgroundColor: 'white',
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingTop: 8,
    paddingBottom: 8,
  },
  searchInputContainer: {
    backgroundColor: '#F7FAFC',
  },
  statusFilter: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  selectedStatusButton: {
    backgroundColor: '#3182CE',
  },
  ticketsList: {
    flex: 1,
  },
  ticketsListContent: {
    padding: 16,
  },
  ticketCard: {
    marginBottom: 16,
    borderRadius: 8,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  ticketHeaderLeft: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#718096',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  divider: {
    marginVertical: 0,
  },
  ticketBody: {
    padding: 16,
  },
  ticketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketInfoText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 8,
  },
  ticketActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F7FAFC',
  },
  actionButtonText: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 16,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#718096',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  browseButton: {
    marginTop: 24,
    backgroundColor: '#3182CE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#718096',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#E53E3E',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#3182CE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  filterOverlay: {
    width: '80%',
    padding: 20,
    borderRadius: 8,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2D3748',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#4A5568',
  },
});

export default MyTicketsPage;