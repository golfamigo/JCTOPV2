import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  ListItem,
  Icon,
  Input,
  Overlay,
  Switch,
  Badge,
  Slider,
  Divider,
  CheckBox,
} from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useAppTheme } from '@/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

// TypeScript interfaces
export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  availableQuantity: number | null; // null means unlimited
  minPurchase: number;
  maxPurchase: number;
  isActive: boolean;
  visibility: 'public' | 'private' | 'hidden';
  saleStartDate?: Date;
  saleEndDate?: Date;
  earlyBird: {
    enabled: boolean;
    price?: number;
    endDate?: Date;
  };
  sold: number;
}

export interface TicketFormData {
  name: string;
  description: string;
  price: string;
  availableQuantity: string;
  isUnlimited: boolean;
  minPurchase: string;
  maxPurchase: string;
  isActive: boolean;
  visibility: 'public' | 'private' | 'hidden';
  saleStartDate?: Date;
  saleEndDate?: Date;
  earlyBird: {
    enabled: boolean;
    price: string;
    endDate?: Date;
  };
}

export interface FormErrors {
  [key: string]: string;
}

// Sample ticket data
const SAMPLE_TICKETS: TicketType[] = [
  {
    id: '1',
    name: '早鳥票',
    description: '限時優惠價格',
    price: 1200,
    availableQuantity: 100,
    minPurchase: 1,
    maxPurchase: 4,
    isActive: true,
    visibility: 'public',
    earlyBird: { enabled: true, price: 1000, endDate: new Date('2025-02-15') },
    sold: 25,
  },
  {
    id: '2',
    name: '一般票',
    description: '標準入場票券',
    price: 1500,
    availableQuantity: null, // unlimited
    minPurchase: 1,
    maxPurchase: 6,
    isActive: true,
    visibility: 'public',
    earlyBird: { enabled: false },
    sold: 150,
  },
  {
    id: '3',
    name: 'VIP票',
    description: '包含特別座位和禮品',
    price: 3000,
    availableQuantity: 50,
    minPurchase: 1,
    maxPurchase: 2,
    isActive: false,
    visibility: 'private',
    earlyBird: { enabled: false },
    sold: 0,
  },
];

export default function TicketsScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  // State management
  const [tickets, setTickets] = useState<TicketType[]>(SAMPLE_TICKETS);
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<TicketFormData>({
    name: '',
    description: '',
    price: '',
    availableQuantity: '',
    isUnlimited: false,
    minPurchase: '1',
    maxPurchase: '6',
    isActive: true,
    visibility: 'public',
    earlyBird: {
      enabled: false,
      price: '',
    },
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEarlyBirdDatePicker, setShowEarlyBirdDatePicker] = useState(false);

  // Responsive design
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const isTablet = dimensions.width >= 768;
  const isDesktop = dimensions.width >= 1200;

  // Currency formatting function
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
  };

  // Validation functions
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Required fields validation
    if (!formData.name.trim()) {
      errors.name = t('tickets.errors.nameRequired');
    } else if (formData.name.length < 5) {
      errors.name = t('tickets.errors.nameTooShort');
    } else if (formData.name.length > 50) {
      errors.name = t('tickets.errors.nameTooLong');
    }

    if (!formData.price.trim()) {
      errors.price = t('tickets.errors.priceRequired');
    } else {
      const price = parseCurrency(formData.price);
      if (price <= 0) {
        errors.price = t('tickets.errors.pricePositive');
      } else if (price > 100000) {
        errors.price = t('tickets.errors.priceTooHigh');
      }
    }

    if (!formData.isUnlimited && !formData.availableQuantity.trim()) {
      errors.availableQuantity = t('tickets.errors.quantityRequired');
    } else if (!formData.isUnlimited) {
      const quantity = parseInt(formData.availableQuantity);
      if (quantity <= 0) {
        errors.availableQuantity = t('tickets.errors.quantityPositive');
      }
    }

    // Optional fields validation
    if (formData.description && formData.description.length > 200) {
      errors.description = t('tickets.errors.descriptionTooLong');
    }

    // Early bird validation
    if (formData.earlyBird.enabled) {
      if (!formData.earlyBird.price.trim()) {
        errors.earlyBirdPrice = t('tickets.errors.earlyBirdPriceRequired');
      } else {
        const earlyBirdPrice = parseCurrency(formData.earlyBird.price);
        const regularPrice = parseCurrency(formData.price);
        if (earlyBirdPrice >= regularPrice) {
          errors.earlyBirdPrice = t('tickets.errors.earlyBirdPriceLower');
        }
      }

      if (!formData.earlyBird.endDate) {
        errors.earlyBirdDate = t('tickets.errors.earlyBirdDateRequired');
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      availableQuantity: '',
      isUnlimited: false,
      minPurchase: '1',
      maxPurchase: '6',
      isActive: true,
      visibility: 'public',
      earlyBird: {
        enabled: false,
        price: '',
      },
    });
    setFormErrors({});
  };

  const handleAddTicket = () => {
    setEditingTicket(null);
    resetForm();
    setIsAddFormVisible(true);
  };

  const handleEditTicket = (ticket: TicketType) => {
    setEditingTicket(ticket);
    setFormData({
      name: ticket.name,
      description: ticket.description || '',
      price: ticket.price.toString(),
      availableQuantity: ticket.availableQuantity?.toString() || '',
      isUnlimited: ticket.availableQuantity === null,
      minPurchase: ticket.minPurchase.toString(),
      maxPurchase: ticket.maxPurchase.toString(),
      isActive: ticket.isActive,
      visibility: ticket.visibility,
      saleStartDate: ticket.saleStartDate,
      saleEndDate: ticket.saleEndDate,
      earlyBird: {
        enabled: ticket.earlyBird.enabled,
        price: ticket.earlyBird.price?.toString() || '',
        endDate: ticket.earlyBird.endDate,
      },
    });
    setIsEditFormVisible(true);
  };

  const handleDeleteTicket = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket?.sold && ticket.sold > 0) {
      Alert.alert(
        t('tickets.cannotDelete'),
        t('tickets.cannotDeleteWithSales'),
        [{ text: t('common.confirm'), style: 'default' }]
      );
      return;
    }

    Alert.alert(
      t('tickets.confirmDelete'),
      t('tickets.confirmDeleteMessage', { name: ticket?.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            setTickets(prev => prev.filter(t => t.id !== ticketId));
          },
        },
      ]
    );
  };

  const handleSaveTicket = () => {
    if (!validateForm()) return;

    const newTicket: TicketType = {
      id: editingTicket?.id || Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      price: parseCurrency(formData.price),
      availableQuantity: formData.isUnlimited ? null : parseInt(formData.availableQuantity),
      minPurchase: parseInt(formData.minPurchase),
      maxPurchase: parseInt(formData.maxPurchase),
      isActive: formData.isActive,
      visibility: formData.visibility,
      saleStartDate: formData.saleStartDate,
      saleEndDate: formData.saleEndDate,
      earlyBird: {
        enabled: formData.earlyBird.enabled,
        price: formData.earlyBird.enabled ? parseCurrency(formData.earlyBird.price) : undefined,
        endDate: formData.earlyBird.endDate,
      },
      sold: editingTicket?.sold || 0,
    };

    if (editingTicket) {
      setTickets(prev => prev.map(t => (t.id === editingTicket.id ? newTicket : t)));
    } else {
      setTickets(prev => [...prev, newTicket]);
    }

    setIsAddFormVisible(false);
    setIsEditFormVisible(false);
    resetForm();
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  // Render ticket status badge
  const renderStatusBadge = (ticket: TicketType) => {
    if (!ticket.isActive) {
      return (
        <Badge
          value={t('tickets.inactive')}
          status="error"
          containerStyle={styles.badge}
        />
      );
    }

    if (ticket.availableQuantity !== null && ticket.availableQuantity <= ticket.sold) {
      return (
        <Badge
          value={t('tickets.soldOut')}
          status="warning"
          containerStyle={styles.badge}
        />
      );
    }

    if (ticket.earlyBird.enabled && ticket.earlyBird.endDate && new Date() <= ticket.earlyBird.endDate) {
      return (
        <Badge
          value={t('tickets.earlyBird')}
          status="success"
          containerStyle={styles.badge}
        />
      );
    }

    return (
      <Badge
        value={t('tickets.active')}
        status="success"
        containerStyle={styles.badge}
      />
    );
  };

  // Render availability info
  const renderAvailability = (ticket: TicketType) => {
    if (ticket.availableQuantity === null) {
      return t('tickets.unlimited');
    }
    
    const remaining = ticket.availableQuantity - ticket.sold;
    return `${remaining} / ${ticket.availableQuantity}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.greyOutline,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.black,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.md,
    },
    ticketItem: {
      marginVertical: spacing.xs,
      borderRadius: 8,
    },
    ticketHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    ticketName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.black,
      flex: 1,
    },
    ticketInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    priceText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    availabilityText: {
      fontSize: 14,
      color: colors.grey3,
    },
    badge: {
      marginLeft: spacing.xs,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    emptyText: {
      fontSize: 18,
      color: colors.grey3,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    emptyDescription: {
      fontSize: 14,
      color: colors.grey3,
      textAlign: 'center',
      marginTop: spacing.sm,
      paddingHorizontal: spacing.xl,
    },
    overlayContent: {
      width: isDesktop ? 600 : isTablet ? 500 : dimensions.width * 0.9,
      maxHeight: dimensions.height * 0.8,
    },
    formTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.black,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    formSection: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.black,
      marginBottom: spacing.md,
    },
    formRow: {
      flexDirection: isTablet ? 'row' : 'column',
      justifyContent: 'space-between',
      alignItems: isTablet ? 'center' : 'stretch',
      marginBottom: spacing.md,
    },
    formField: {
      flex: isTablet ? 1 : undefined,
      marginRight: isTablet ? spacing.md : 0,
    },
    formFieldLast: {
      marginRight: 0,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: spacing.sm,
    },
    switchLabel: {
      fontSize: 16,
      color: colors.black,
      flex: 1,
    },
    quantitySlider: {
      marginVertical: spacing.md,
    },
    sliderLabel: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    sliderValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    visibilityOptions: {
      marginVertical: spacing.sm,
    },
    dateButton: {
      borderColor: colors.greyOutline,
      borderWidth: 1,
      borderRadius: 4,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      marginVertical: spacing.sm,
    },
    dateButtonText: {
      fontSize: 16,
      color: colors.black,
    },
    formButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.lg,
      gap: spacing.md,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.grey0,
    },
    cancelButtonTitle: {
      color: colors.grey3,
    },
    saveButton: {
      flex: 1,
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginTop: spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.black} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('tickets.ticketConfiguration')}</Text>
        <Button
          title={t('tickets.addTicket')}
          buttonStyle={{ paddingHorizontal: spacing.md }}
          titleStyle={{ fontSize: 14 }}
          onPress={handleAddTicket}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {tickets.length === 0 ? (
          // Empty state
          <View style={styles.emptyState}>
            <Icon name="confirmation-num" size={64} color={colors.grey2} />
            <Text style={styles.emptyText}>{t('tickets.noTickets')}</Text>
            <Text style={styles.emptyDescription}>
              {t('tickets.noTicketsDescription')}
            </Text>
            <Button
              title={t('tickets.createFirstTicket')}
              onPress={handleAddTicket}
              containerStyle={{ marginTop: spacing.lg }}
            />
          </View>
        ) : (
          // Ticket list
          tickets.map((ticket) => (
            <Card key={ticket.id} containerStyle={styles.ticketItem}>
              <ListItem
                onPress={() => handleEditTicket(ticket)}
                containerStyle={{ paddingHorizontal: 0 }}
              >
                <ListItem.Content>
                  <View style={styles.ticketHeader}>
                    <Text style={styles.ticketName}>{ticket.name}</Text>
                    {renderStatusBadge(ticket)}
                  </View>
                  
                  {ticket.description && (
                    <Text style={{ color: colors.grey3, marginBottom: spacing.xs }}>
                      {ticket.description}
                    </Text>
                  )}
                  
                  <View style={styles.ticketInfo}>
                    <View>
                      <Text style={styles.priceText}>
                        {ticket.earlyBird.enabled && 
                         ticket.earlyBird.endDate && 
                         new Date() <= ticket.earlyBird.endDate && 
                         ticket.earlyBird.price
                          ? `${formatCurrency(ticket.earlyBird.price)} (${t('tickets.earlyBird')})`
                          : formatCurrency(ticket.price)
                        }
                      </Text>
                      <Text style={styles.availabilityText}>
                        {t('tickets.available')}: {renderAvailability(ticket)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <Icon
                        name="edit"
                        size={20}
                        color={colors.primary}
                        onPress={() => handleEditTicket(ticket)}
                        containerStyle={{ marginRight: spacing.md }}
                      />
                      <Icon
                        name="delete"
                        size={20}
                        color={colors.error}
                        onPress={() => handleDeleteTicket(ticket.id)}
                      />
                    </View>
                  </View>
                </ListItem.Content>
              </ListItem>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Form Overlay */}
      <Overlay
        isVisible={isAddFormVisible || isEditFormVisible}
        onBackdropPress={() => {
          setIsAddFormVisible(false);
          setIsEditFormVisible(false);
          resetForm();
        }}
        overlayStyle={styles.overlayContent}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.formTitle}>
              {editingTicket ? t('tickets.editTicket') : t('tickets.addTicket')}
            </Text>

            {/* Basic Information */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>{t('tickets.basicInformation')}</Text>
              
              <Input
                label={t('tickets.ticketName')}
                placeholder={t('tickets.ticketNamePlaceholder')}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                errorMessage={formErrors.name}
                maxLength={50}
              />

              <Input
                label={`${t('tickets.description')} (${t('common.optional')})`}
                placeholder={t('tickets.descriptionPlaceholder')}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                errorMessage={formErrors.description}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            {/* Pricing */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>{t('tickets.pricing')}</Text>
              
              <Input
                label={t('tickets.price')}
                placeholder={t('tickets.pricePlaceholder')}
                value={formData.price}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^\d]/g, '');
                  const formatted = numericValue ? `${parseInt(numericValue)}` : '';
                  setFormData(prev => ({ ...prev, price: formatted }));
                }}
                errorMessage={formErrors.price}
                keyboardType="numeric"
                leftIcon={{ name: 'attach-money', color: colors.grey3 }}
              />
            </View>

            {/* Quantity Management */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>{t('tickets.quantityManagement')}</Text>
              
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{t('tickets.unlimitedQuantity')}</Text>
                <Switch
                  value={formData.isUnlimited}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isUnlimited: value }))}
                />
              </View>

              {!formData.isUnlimited && (
                <Input
                  label={t('tickets.availableQuantity')}
                  placeholder={t('tickets.quantityPlaceholder')}
                  value={formData.availableQuantity}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, availableQuantity: text }))}
                  errorMessage={formErrors.availableQuantity}
                  keyboardType="numeric"
                />
              )}

              <View style={styles.formRow}>
                <Input
                  label={t('tickets.minPurchase')}
                  value={formData.minPurchase}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, minPurchase: text }))}
                  keyboardType="numeric"
                  containerStyle={styles.formField}
                />
                <Input
                  label={t('tickets.maxPurchase')}
                  value={formData.maxPurchase}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, maxPurchase: text }))}
                  keyboardType="numeric"
                  containerStyle={styles.formFieldLast}
                />
              </View>
            </View>

            {/* Early Bird Settings */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>{t('tickets.earlyBirdSettings')}</Text>
              
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{t('tickets.enableEarlyBird')}</Text>
                <Switch
                  value={formData.earlyBird.enabled}
                  onValueChange={(value) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      earlyBird: { ...prev.earlyBird, enabled: value }
                    }))
                  }
                />
              </View>

              {formData.earlyBird.enabled && (
                <>
                  <Input
                    label={t('tickets.earlyBirdPrice')}
                    placeholder={t('tickets.earlyBirdPricePlaceholder')}
                    value={formData.earlyBird.price}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^\d]/g, '');
                      const formatted = numericValue ? `${parseInt(numericValue)}` : '';
                      setFormData(prev => ({ 
                        ...prev, 
                        earlyBird: { ...prev.earlyBird, price: formatted }
                      }));
                    }}
                    errorMessage={formErrors.earlyBirdPrice}
                    keyboardType="numeric"
                    leftIcon={{ name: 'attach-money', color: colors.grey3 }}
                  />

                  <Pressable
                    style={styles.dateButton}
                    onPress={() => setShowEarlyBirdDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {formData.earlyBird.endDate
                        ? `${t('tickets.earlyBirdEndDate')}: ${formData.earlyBird.endDate.toLocaleDateString('zh-TW')}`
                        : t('tickets.selectEarlyBirdEndDate')
                      }
                    </Text>
                  </Pressable>
                  {formErrors.earlyBirdDate && (
                    <Text style={styles.errorText}>{formErrors.earlyBirdDate}</Text>
                  )}
                </>
              )}
            </View>

            {/* Status and Visibility */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>{t('tickets.statusAndVisibility')}</Text>
              
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{t('tickets.activeTicket')}</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
                />
              </View>

              <Text style={{ fontSize: 16, marginBottom: spacing.sm, color: colors.black }}>
                {t('tickets.visibility')}
              </Text>
              <View style={styles.visibilityOptions}>
                <CheckBox
                  title={t('tickets.publicVisible')}
                  checked={formData.visibility === 'public'}
                  onPress={() => setFormData(prev => ({ ...prev, visibility: 'public' }))}
                />
                <CheckBox
                  title={t('tickets.privateVisible')}
                  checked={formData.visibility === 'private'}
                  onPress={() => setFormData(prev => ({ ...prev, visibility: 'private' }))}
                />
                <CheckBox
                  title={t('tickets.hiddenVisible')}
                  checked={formData.visibility === 'hidden'}
                  onPress={() => setFormData(prev => ({ ...prev, visibility: 'hidden' }))}
                />
              </View>
            </View>

            {/* Form Actions */}
            <View style={styles.formButtons}>
              <Button
                title={t('common.cancel')}
                buttonStyle={styles.cancelButton}
                titleStyle={styles.cancelButtonTitle}
                onPress={() => {
                  setIsAddFormVisible(false);
                  setIsEditFormVisible(false);
                  resetForm();
                }}
              />
              <Button
                title={t('common.save')}
                buttonStyle={styles.saveButton}
                onPress={handleSaveTicket}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Overlay>

      {/* Date Pickers */}
      {showEarlyBirdDatePicker && (
        <DateTimePicker
          value={formData.earlyBird.endDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEarlyBirdDatePicker(false);
            if (selectedDate) {
              setFormData(prev => ({
                ...prev,
                earlyBird: { ...prev.earlyBird, endDate: selectedDate }
              }));
            }
          }}
        />
      )}
    </View>
  );
}