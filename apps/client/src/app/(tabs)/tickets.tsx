import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Share, Alert } from 'react-native';
import { Text, Tab, TabView, Skeleton, Card, Button } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import registrationService from '@/services/registrationService';
import { TicketCard } from '@/components/features/user/TicketCard';
import { QRCodeModal } from '@/components/features/user/QRCodeModal';
import type { Registration } from '@shared/types';

export default function TicketsScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    try {
      setError(null);
      const data = await registrationService.getUserRegistrations();
      setRegistrations(data);
    } catch (err) {
      setError(t('common.error', { defaultValue: '發生錯誤' }));
      console.error('Failed to fetch registrations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRegistrations();
  }, [fetchRegistrations]);

  const filterRegistrations = (registrations: Registration[], type: 'upcoming' | 'past') => {
    const now = new Date();
    return registrations.filter(reg => {
      if (!reg.event) return false;
      const eventDate = new Date(reg.event.startDate);
      return type === 'upcoming' ? eventDate >= now : eventDate < now;
    });
  };

  const upcomingRegistrations = filterRegistrations(registrations, 'upcoming');
  const pastRegistrations = filterRegistrations(registrations, 'past');

  const renderEmptyState = (type: 'upcoming' | 'past') => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons 
        name="ticket-outline" 
        size={80} 
        color={colors.textSecondary} 
      />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {type === 'upcoming' 
          ? t('tickets.noUpcomingTickets', { defaultValue: '沒有即將到來的活動票券' })
          : t('tickets.noPastTickets', { defaultValue: '沒有已結束的活動票券' })
        }
      </Text>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      {[1, 2, 3].map((i) => (
        <Card key={i} containerStyle={[styles.skeletonCard, { backgroundColor: colors.card }]}>
          <Skeleton animation="pulse" height={100} />
        </Card>
      ))}
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons 
        name="alert-circle-outline" 
        size={60} 
        color={colors.danger} 
      />
      <Text style={[styles.errorText, { color: colors.textPrimary }]}>
        {error}
      </Text>
      <Button 
        title={t('common.retry', { defaultValue: '重試' })}
        onPress={fetchRegistrations}
        buttonStyle={[styles.retryButton, { backgroundColor: colors.primary }]}
      />
    </View>
  );

  const handleViewQRCode = (registration: Registration) => {
    setSelectedRegistration(registration);
    setQrModalVisible(true);
  };

  const handleViewDetails = useCallback((registration: Registration) => {
    // TODO: Implement navigation to event details when navigation is configured
    console.log('View details for:', registration.id);
  }, []);

  const handleDownloadTicket = useCallback(async () => {
    // TODO: Implement actual download functionality when backend API is ready
    Alert.alert(
      t('tickets.actions.downloadTicket'),
      t('common.comingSoon', { defaultValue: '即將推出' })
    );
  }, [t]);

  const handleShareTicket = useCallback(async () => {
    if (!selectedRegistration?.event) return;
    
    try {
      const formattedId = selectedRegistration.id.substring(0, 8).toUpperCase();
      const formattedDate = new Date(selectedRegistration.event.startDate).toLocaleDateString('zh-TW');
      
      const message = [
        selectedRegistration.event.title,
        `${t('tickets.registrationId')}: ${formattedId}`,
        `${t('events.eventDate')}: ${formattedDate}`
      ].join('\n');
      
      await Share.share({
        message,
        title: t('tickets.actions.shareTicket'),
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [selectedRegistration, t]);

  const renderTicketList = (tickets: Registration[]) => {
    if (tickets.length === 0) {
      return renderEmptyState(activeTab === 0 ? 'upcoming' : 'past');
    }

    return (
      <View style={styles.ticketList}>
        {tickets.map((registration) => (
          <TicketCard
            key={registration.id}
            registration={registration}
            onViewQRCode={() => handleViewQRCode(registration)}
            onViewDetails={() => handleViewDetails(registration)}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text h3 style={[styles.title, { color: colors.textPrimary }]}>
          {t('tickets.title', { defaultValue: '我的票券' })}
        </Text>
      </View>

      <Tab
        value={activeTab}
        onChange={setActiveTab}
        indicatorStyle={{ backgroundColor: colors.primary }}
        style={styles.tabContainer}
      >
        <Tab.Item
          title={t('tickets.upcoming', { defaultValue: '即將到來' })}
          titleStyle={[styles.tabTitle, { color: activeTab === 0 ? colors.primary : colors.textSecondary }]}
        />
        <Tab.Item
          title={t('tickets.past', { defaultValue: '已結束' })}
          titleStyle={[styles.tabTitle, { color: activeTab === 1 ? colors.primary : colors.textSecondary }]}
        />
      </Tab>

      <TabView value={activeTab} onChange={setActiveTab} animationType="spring">
        <TabView.Item style={styles.tabViewItem}>
          <ScrollView
            testID="scrollView"
            style={styles.scrollView}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            {loading ? renderLoading() : error ? renderError() : renderTicketList(upcomingRegistrations)}
          </ScrollView>
        </TabView.Item>
        <TabView.Item style={styles.tabViewItem}>
          <ScrollView
            testID="scrollView"
            style={styles.scrollView}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            {loading ? renderLoading() : error ? renderError() : renderTicketList(pastRegistrations)}
          </ScrollView>
        </TabView.Item>
      </TabView>

      <QRCodeModal
        visible={qrModalVisible}
        registration={selectedRegistration}
        onClose={() => {
          setQrModalVisible(false);
          setSelectedRegistration(null);
        }}
        onDownload={handleDownloadTicket}
        onShare={handleShareTicket}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tabContainer: {
    backgroundColor: 'transparent',
  },
  tabTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabViewItem: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 16,
  },
  skeletonCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  ticketList: {
    padding: 16,
  },
});