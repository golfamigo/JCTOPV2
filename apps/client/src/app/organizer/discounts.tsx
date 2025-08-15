import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Text, Button, FAB, SearchBar, Overlay } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import discountCodeService from '@/services/discountCodeService';
import { DiscountCodeResponse as BaseDiscountCodeResponse } from '@jctop-event/shared-types';
import DiscountCodeManagementList from '@/components/features/organizer/DiscountCodeManagementList';
import DiscountCodeFormModal from '@/components/features/organizer/DiscountCodeFormModal';
import DiscountCodeStatistics from '@/components/features/organizer/DiscountCodeStatistics';

// Extend the interface to include status
interface DiscountCodeResponse extends BaseDiscountCodeResponse {
  status?: 'active' | 'inactive';
}

export default function DiscountsScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  
  const [discountCodes, setDiscountCodes] = useState<DiscountCodeResponse[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<DiscountCodeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCodeResponse | null>(null);
  const [eventId] = useState('demo-event-1'); // TODO: Get from route params or context

  // Load discount codes
  const loadDiscountCodes = useCallback(async () => {
    try {
      setLoading(true);
      const codes = await discountCodeService.getDiscountCodes(eventId);
      setDiscountCodes(codes);
      setFilteredCodes(codes);
    } catch (error) {
      console.error('Failed to load discount codes:', error);
      Alert.alert(
        t('common.error'),
        t('discounts.loadError')
      );
    } finally {
      setLoading(false);
    }
  }, [eventId, t]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDiscountCodes();
    setRefreshing(false);
  }, [loadDiscountCodes]);

  // Search filter
  useEffect(() => {
    if (searchQuery) {
      const filtered = discountCodes.filter(code =>
        code.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCodes(filtered);
    } else {
      setFilteredCodes(discountCodes);
    }
  }, [searchQuery, discountCodes]);

  // Initial load
  useEffect(() => {
    loadDiscountCodes();
  }, [loadDiscountCodes]);

  // Handle edit
  const handleEdit = useCallback((code: DiscountCodeResponse) => {
    setEditingCode(code);
    setShowFormModal(true);
  }, []);

  // Handle delete
  const handleDelete = useCallback(async (code: DiscountCodeResponse) => {
    Alert.alert(
      t('discounts.deleteTitle'),
      t('discounts.deleteConfirm', { code: code.code }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await discountCodeService.deleteDiscountCode(eventId, code.id);
              await loadDiscountCodes();
              Alert.alert(t('common.success'), t('discounts.deleteSuccess'));
            } catch (error) {
              Alert.alert(t('common.error'), t('discounts.deleteError'));
            }
          }
        }
      ]
    );
  }, [eventId, t, loadDiscountCodes]);

  // Handle toggle active
  const handleToggleActive = useCallback(async (code: DiscountCodeResponse) => {
    try {
      // Optimistic update (using a status field since isActive doesn't exist in the interface)
      const updatedCodes = discountCodes.map(c =>
        c.id === code.id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
      ) as DiscountCodeResponse[];
      setDiscountCodes(updatedCodes);
      setFilteredCodes(updatedCodes);

      // API call
      await discountCodeService.updateDiscountCode(eventId, code.id, {
        status: code.status === 'active' ? 'inactive' : 'active'
      } as any);
    } catch (error) {
      // Rollback on error
      await loadDiscountCodes();
      Alert.alert(t('common.error'), t('discounts.toggleError'));
    }
  }, [eventId, discountCodes, t, loadDiscountCodes]);

  // Handle form submit
  const handleFormSubmit = useCallback(async () => {
    setShowFormModal(false);
    setEditingCode(null);
    await loadDiscountCodes();
  }, [loadDiscountCodes]);

  // Handle form close
  const handleFormClose = useCallback(() => {
    setShowFormModal(false);
    setEditingCode(null);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <Text h2 style={[styles.title, { color: colors.dark }]}>
          {t('discounts.title')}
        </Text>
      </View>

      {/* Search Bar */}
      <SearchBar
        placeholder={t('discounts.searchPlaceholder')}
        onChangeText={setSearchQuery}
        value={searchQuery}
        platform="default"
        containerStyle={[styles.searchContainer, { backgroundColor: colors.white }]}
        inputContainerStyle={{ backgroundColor: colors.grey1 }}
        searchIcon={<MaterialCommunityIcons name="magnify" size={24} color={colors.grey3} />}
        clearIcon={<MaterialCommunityIcons name="close-circle" size={24} color={colors.grey3} />}
      />

      {/* Statistics Cards */}
      <DiscountCodeStatistics codes={discountCodes} />

      {/* Discount Codes List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <DiscountCodeManagementList
          codes={filteredCodes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          loading={loading}
        />
      </ScrollView>

      {/* FAB for adding new discount code */}
      <FAB
        placement="right"
        icon={<MaterialCommunityIcons name="plus" size={24} color={colors.white} />}
        color={colors.primary}
        onPress={() => setShowFormModal(true)}
        style={styles.fab}
      />

      {/* Form Modal */}
      <DiscountCodeFormModal
        visible={showFormModal}
        eventId={eventId}
        discountCode={editingCode}
        onClose={handleFormClose}
        onSuccess={handleFormSubmit}
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
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  searchContainer: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scrollView: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});