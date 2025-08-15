import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Button, Text, Card, Icon } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { DiscountCodeResponse, CreateDiscountCodeDto, UpdateDiscountCodeDto } from '@jctop-event/shared-types';
import discountCodeService from '../../../services/discountCodeService';
import DiscountCodeForm from './DiscountCodeForm';
import DiscountCodeCard from './DiscountCodeCard';
import { useAppTheme } from '../../../theme';

interface DiscountCodeListProps {
  eventId: string;
}

const DiscountCodeList: React.FC<DiscountCodeListProps> = ({ eventId }) => {
  const [discountCodes, setDiscountCodes] = useState<DiscountCodeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCodeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const { colors } = useAppTheme();

  useEffect(() => {
    loadDiscountCodes();
  }, [eventId]);

  const loadDiscountCodes = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      const codes = await discountCodeService.getDiscountCodes(eventId);
      setDiscountCodes(codes);
    } catch (error) {
      console.error('Error loading discount codes:', error);
      setError(error instanceof Error ? error.message : 'Failed to load discount codes');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleCreateCode = async (data: CreateDiscountCodeDto) => {
    setIsSubmitting(true);
    try {
      const newCode = await discountCodeService.createDiscountCode(eventId, data);
      setDiscountCodes(prev => [newCode, ...prev]);
      setShowForm(false);
    } catch (error) {
      throw error; // Re-throw to be handled by the form
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCode = async (data: UpdateDiscountCodeDto) => {
    if (!editingCode) return;
    
    setIsSubmitting(true);
    try {
      const updatedCode = await discountCodeService.updateDiscountCode(
        eventId, 
        editingCode.id, 
        data
      );
      setDiscountCodes(prev => 
        prev.map(code => code.id === editingCode.id ? updatedCode : code)
      );
      setEditingCode(null);
      setShowForm(false);
    } catch (error) {
      throw error; // Re-throw to be handled by the form
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    try {
      await discountCodeService.deleteDiscountCode(eventId, codeId);
      setDiscountCodes(prev => prev.filter(code => code.id !== codeId));
      
      Alert.alert('Success', 'Discount code deleted successfully');
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to delete discount code: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`
      );
    }
  };

  const handleEditCode = (code: DiscountCodeResponse) => {
    setEditingCode(code);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingCode(null);
    setShowForm(false);
  };

  const getStatsData = () => {
    const totalCodes = discountCodes.length;
    const activeCodes = discountCodes.filter(code => 
      !code.expiresAt || new Date(code.expiresAt) > new Date()
    ).length;
    const totalUsage = discountCodes.reduce((sum, code) => sum + code.usageCount, 0);
    
    return { totalCodes, activeCodes, totalUsage };
  };

  const { totalCodes, activeCodes, totalUsage } = getStatsData();

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.grey2 }]}>
          Loading discount codes...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadDiscountCodes(true)}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text h3 style={[styles.title, { color: colors.text }]}>
              Discount Codes
            </Text>
            <Text style={[styles.subtitle, { color: colors.grey2 }]}>
              Manage promotional codes for your event
            </Text>
          </View>
          
          <Button
            title="Create Code"
            onPress={() => setShowForm(true)}
            disabled={isLoading}
            buttonStyle={[styles.createButton, { backgroundColor: colors.primary }]}
            icon={
              <Icon
                name="add"
                type="material"
                color={colors.white}
                size={20}
                containerStyle={styles.buttonIcon}
              />
            }
          />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card containerStyle={[styles.statCard, { backgroundColor: colors.primary + '10' }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {totalCodes}
            </Text>
            <Text style={[styles.statLabel, { color: colors.grey2 }]}>
              Total Codes
            </Text>
          </Card>
          
          <Card containerStyle={[styles.statCard, { backgroundColor: colors.success + '10' }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {activeCodes}
            </Text>
            <Text style={[styles.statLabel, { color: colors.grey2 }]}>
              Active Codes
            </Text>
          </Card>
          
          <Card containerStyle={[styles.statCard, { backgroundColor: colors.secondary + '10' }]}>
            <Text style={[styles.statValue, { color: colors.secondary }]}>
              {totalUsage}
            </Text>
            <Text style={[styles.statLabel, { color: colors.grey2 }]}>
              Total Usage
            </Text>
          </Card>
        </View>

        {/* Error State */}
        {error && (
          <View style={[styles.errorContainer, { 
            backgroundColor: colors.error + '10',
            borderColor: colors.error 
          }]}>
            <Icon
              name="error"
              type="material"
              color={colors.error}
              size={20}
              containerStyle={styles.errorIcon}
            />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Discount Codes List */}
        {discountCodes.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
            <Icon
              name="local-offer"
              type="material"
              color={colors.grey3}
              size={48}
            />
            <Text style={[styles.emptyTitle, { color: colors.grey2 }]}>
              No discount codes created yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.grey3 }]}>
              Create your first discount code to start offering promotions to your customers
            </Text>
            <Button
              title="Create Your First Discount Code"
              onPress={() => setShowForm(true)}
              buttonStyle={[styles.createButton, { backgroundColor: colors.primary }]}
              icon={
                <Icon
                  name="add"
                  type="material"
                  color={colors.white}
                  size={20}
                  containerStyle={styles.buttonIcon}
                />
              }
            />
          </View>
        ) : (
          <View style={styles.listContainer}>
            {discountCodes.map((code) => (
              <DiscountCodeCard
                key={code.id}
                discountCode={code}
                onEdit={handleEditCode}
                onDelete={handleDeleteCode}
                isLoading={isSubmitting}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Form Modal */}
      <DiscountCodeForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={editingCode ? handleUpdateCode as any : handleCreateCode as any}
        initialData={editingCode || undefined}
        isLoading={isSubmitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  createButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  emptyContainer: {
    margin: 16,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

export default DiscountCodeList;