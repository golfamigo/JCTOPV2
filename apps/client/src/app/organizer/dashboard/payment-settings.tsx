import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Button,
  Text,
  Card,
  Badge,
  Icon,
  Header,
  Divider,
  ListItem,
  Overlay,
} from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { PaymentProvider } from '@jctop-event/shared-types';
import paymentService from '../../../services/paymentService';
import PaymentProviderCredentialsForm from '../../../components/features/organizer/PaymentProviderCredentialsForm';
import { useAppTheme } from '@/theme';
import { useNavigation } from '@react-navigation/native';

const PaymentSettingsPage: React.FC = () => {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [actionType, setActionType] = useState<'create' | 'edit'>('create');
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { colors, spacing } = useAppTheme();
  const navigation = useNavigation();

  useEffect(() => {
    loadPaymentProviders();
  }, []);

  const loadPaymentProviders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await paymentService.getPaymentProviders();
      setProviders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment providers');
      Alert.alert('Error', 'Failed to load payment providers');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPaymentProviders();
  };

  const handleToggleProvider = async (providerId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await paymentService.deactivateProvider(providerId);
      } else {
        await paymentService.activateProvider(providerId);
      }
      await loadPaymentProviders();
      Alert.alert('Success', `Provider ${isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update provider');
    }
  };

  const handleCreateProvider = () => {
    setSelectedProvider(null);
    setSelectedProviderId('');
    setActionType('create');
    setShowCredentialsModal(true);
  };

  const handleEditProvider = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    setSelectedProviderId(provider.id);
    setActionType('edit');
    setShowCredentialsModal(true);
  };

  const handleDeleteProvider = (providerId: string) => {
    Alert.alert(
      'Delete Provider',
      'Are you sure you want to delete this payment provider?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await paymentService.deleteProvider(providerId);
              await loadPaymentProviders();
              Alert.alert('Success', 'Provider deleted successfully');
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete provider');
            }
          },
        },
      ]
    );
  };

  const handleSaveCredentials = async (credentials: any) => {
    try {
      if (actionType === 'create') {
        await paymentService.createProvider(credentials);
      } else {
        await paymentService.updateProviderCredentials(selectedProviderId, credentials);
      }
      
      setShowCredentialsModal(false);
      await loadPaymentProviders();
      Alert.alert('Success', `Provider ${actionType === 'create' ? 'created' : 'updated'} successfully`);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : `Failed to ${actionType} provider`);
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ecpay':
        return 'credit-card';
      case 'apple_pay':
        return 'phone-iphone';
      case 'google_pay':
        return 'android';
      case 'line_pay':
        return 'message';
      case 'paypal':
        return 'payment';
      default:
        return 'payment';
    }
  };

  const isProviderConfigured = (provider: PaymentProvider): boolean => {
    return Boolean(provider.credentials && typeof provider.credentials === 'object' && Object.keys(provider.credentials).length > 0);
  };

  const getProviderStatusColor = (isActive: boolean, isConfigured: boolean) => {
    if (!isConfigured) return colors.warning;
    return isActive ? colors.success : colors.grey3;
  };

  const renderProvider = (provider: PaymentProvider) => (
    <Card key={provider.id} containerStyle={styles.providerCard}>
      <View style={styles.providerHeader}>
        <View style={styles.providerInfo}>
          <Icon
            name={getProviderIcon(provider.providerId)}
            type="material"
            size={32}
            color={colors.primary}
          />
          <View style={styles.providerDetails}>
            <Text h4>{provider.providerName}</Text>
            <Text style={styles.providerType}>{provider.providerId.toUpperCase()}</Text>
          </View>
        </View>
        <Badge
          value={provider.isActive ? 'Active' : isProviderConfigured(provider) ? 'Inactive' : 'Not Configured'}
          badgeStyle={[
            styles.statusBadge,
            { backgroundColor: getProviderStatusColor(provider.isActive, isProviderConfigured(provider)) }
          ]}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.providerContent}>
        {provider.configuration?.description && (
          <Text style={styles.description}>{provider.configuration.description}</Text>
        )}
        
        <View style={styles.configInfo}>
          <Text style={styles.configLabel}>Configuration Status:</Text>
          <Text style={[styles.configValue, { color: isProviderConfigured(provider) ? colors.success : colors.warning }]}>
            {isProviderConfigured(provider) ? '✓ Configured' : '⚠ Not Configured'}
          </Text>
        </View>

        {isProviderConfigured(provider) && provider.configuration?.merchantId && (
          <View style={styles.configInfo}>
            <Text style={styles.configLabel}>Merchant ID:</Text>
            <Text style={styles.configValue}>{provider.configuration.merchantId}</Text>
          </View>
        )}

        {provider.configuration?.supportedCurrencies && provider.configuration.supportedCurrencies.length > 0 && (
          <View style={styles.configInfo}>
            <Text style={styles.configLabel}>Supported Currencies:</Text>
            <View style={styles.currencyList}>
              {provider.configuration.supportedCurrencies.map((currency: string) => (
                <Badge
                  key={currency}
                  value={currency}
                  badgeStyle={styles.currencyBadge}
                  textStyle={styles.currencyText}
                />
              ))}
            </View>
          </View>
        )}
      </View>

      <Divider style={styles.divider} />

      <View style={styles.providerActions}>
        <Button
          title={provider.isActive ? 'Deactivate' : 'Activate'}
          type={provider.isActive ? 'outline' : 'solid'}
          buttonStyle={[
            styles.actionButton,
            provider.isActive && { borderColor: colors.error }
          ]}
          titleStyle={provider.isActive && { color: colors.error }}
          onPress={() => handleToggleProvider(provider.id, provider.isActive)}
          disabled={!isProviderConfigured(provider)}
        />
        <Button
          title="Configure"
          type="outline"
          buttonStyle={styles.actionButton}
          onPress={() => handleEditProvider(provider)}
        />
        <Button
          title="Delete"
          type="clear"
          titleStyle={{ color: colors.error }}
          onPress={() => handleDeleteProvider(provider.id)}
        />
      </View>
    </Card>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          leftComponent={
            <Icon
              name="arrow-back"
              type="material"
              color={colors.white}
              onPress={() => navigation.goBack()}
            />
          }
          centerComponent={{ text: 'Payment Settings', style: { color: colors.white } }}
          backgroundColor={colors.primary}
        />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading payment providers...</Text>
        </View>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          leftComponent={
            <Icon
              name="arrow-back"
              type="material"
              color={colors.white}
              onPress={() => navigation.goBack()}
            />
          }
          centerComponent={{ text: 'Payment Settings', style: { color: colors.white } }}
          backgroundColor={colors.primary}
        />
        <View style={styles.centerContent}>
          <Icon name="error-outline" type="material" color={colors.error} size={48} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <Button
            title="Retry"
            onPress={loadPaymentProviders}
            buttonStyle={[styles.retryButton, { backgroundColor: colors.primary }]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        leftComponent={
          <Icon
            name="arrow-back"
            type="material"
            color={colors.white}
            onPress={() => navigation.goBack()}
          />
        }
        centerComponent={{ text: 'Payment Settings', style: { color: colors.white } }}
        rightComponent={
          <Icon
            name="add"
            type="material"
            color={colors.white}
            onPress={handleCreateProvider}
          />
        }
        backgroundColor={colors.primary}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Info Alert */}
        <Card containerStyle={styles.infoCard}>
          <View style={styles.infoContent}>
            <Icon name="info-outline" type="material" color={colors.primary} size={24} />
            <Text style={styles.infoText}>
              Configure payment providers to accept payments for your events. 
              You can enable multiple providers to give attendees more payment options.
            </Text>
          </View>
        </Card>

        {/* Provider List */}
        {providers.length > 0 ? (
          providers.map(renderProvider)
        ) : (
          <Card containerStyle={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Icon name="payment" type="material" color={colors.grey3} size={64} />
              <Text style={styles.emptyText}>No payment providers configured</Text>
              <Button
                title="Add Payment Provider"
                onPress={handleCreateProvider}
                buttonStyle={[styles.addButton, { backgroundColor: colors.primary }]}
              />
            </View>
          </Card>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Credentials Modal */}
      <Overlay
        isVisible={showCredentialsModal}
        onBackdropPress={() => setShowCredentialsModal(false)}
        overlayStyle={styles.modalOverlay}
      >
        <View>
          <Text h4 style={styles.modalTitle}>
            {actionType === 'create' ? 'Add Payment Provider' : 'Update Provider Configuration'}
          </Text>
          <Divider style={styles.divider} />
          
          {showCredentialsModal && selectedProvider && (
            <PaymentProviderCredentialsForm
              provider={selectedProvider}
              providerId={selectedProvider.id}
              onSave={handleSaveCredentials}
              onCancel={() => setShowCredentialsModal(false)}
            />
          )}
        </View>
      </Overlay>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 30,
  },
  infoCard: {
    margin: 15,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 1,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  providerCard: {
    margin: 15,
    marginTop: 0,
    borderRadius: 8,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerDetails: {
    marginLeft: 15,
  },
  providerType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  divider: {
    marginVertical: 10,
  },
  providerContent: {
    marginVertical: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  configInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  configLabel: {
    fontSize: 14,
    color: '#666',
  },
  configValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  currencyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  currencyBadge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 8,
    marginRight: 5,
    marginTop: 5,
  },
  currencyText: {
    fontSize: 12,
    color: '#333',
  },
  providerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  emptyCard: {
    margin: 15,
    borderRadius: 8,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 15,
  },
  addButton: {
    borderRadius: 8,
    paddingHorizontal: 30,
  },
  modalOverlay: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 10,
  },
});

export default PaymentSettingsPage;