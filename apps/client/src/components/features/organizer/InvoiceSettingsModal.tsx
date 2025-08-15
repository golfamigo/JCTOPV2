import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Button,
  Input,
  Text,
  Overlay,
  Card,
  Divider,
} from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { InvoiceSettings } from '@jctop-event/shared-types';
import { useReportStore } from '../../../stores/reportStore';
import invoiceService, { CreateInvoiceSettingsRequest } from '../../../services/invoiceService';
import { useAppTheme } from '@/theme';

interface InvoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
}

export const InvoiceSettingsModal: React.FC<InvoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle,
}) => {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const {
    invoiceSettings,
    invoiceSettingsLoading,
    invoiceSettingsError,
    setInvoiceSettings,
    setInvoiceSettingsLoading,
    setInvoiceSettingsError,
  } = useReportStore();

  const [formData, setFormData] = useState<CreateInvoiceSettingsRequest>({
    companyName: '',
    companyAddress: '',
    taxNumber: '',
    invoicePrefix: '',
    invoiceFooter: '',
    customFields: {},
  });

  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInvoiceSettings();
    }
  }, [isOpen, eventId]);

  useEffect(() => {
    if (invoiceSettings) {
      setFormData({
        companyName: invoiceSettings.companyName || '',
        companyAddress: invoiceSettings.companyAddress || '',
        taxNumber: invoiceSettings.taxNumber || '',
        invoicePrefix: invoiceSettings.invoicePrefix || '',
        invoiceFooter: invoiceSettings.invoiceFooter || '',
        customFields: invoiceSettings.customFields || {},
      });
    }
  }, [invoiceSettings]);

  const loadInvoiceSettings = async () => {
    setInvoiceSettingsLoading(true);
    setInvoiceSettingsError(null);

    try {
      const settings = await invoiceService.getInvoiceSettings(eventId);
      setInvoiceSettings(settings);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load invoice settings';
      setInvoiceSettingsError(errorMessage);
    } finally {
      setInvoiceSettingsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateInvoiceSettingsRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const isUpdate = !!invoiceSettings;
      const savedSettings = await invoiceService.saveInvoiceSettings(
        eventId,
        formData,
        isUpdate
      );
      
      setInvoiceSettings(savedSettings);
      
      Alert.alert(
        t('invoice.settingsUpdated'),
        t('invoice.settingsUpdateSuccess')
      );

      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save invoice settings';
      Alert.alert(
        t('common.error'),
        errorMessage
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!invoiceSettings) return;
    
    setIsSaving(true);

    try {
      await invoiceService.deleteInvoiceSettings(eventId);
      setInvoiceSettings(null);
      setFormData({
        companyName: '',
        companyAddress: '',
        taxNumber: '',
        invoicePrefix: '',
        invoiceFooter: '',
        customFields: {},
      });

      Alert.alert(
        t('invoice.deleteSuccess'),
        t('invoice.settingsDeleted')
      );

      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete invoice settings';
      Alert.alert(
        t('common.error'),
        errorMessage
      );
    } finally {
      setIsSaving(false);
    }
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  return (
    <Overlay isVisible={isOpen} onBackdropPress={onClose} overlayStyle={{
      width: '90%',
      maxWidth: 500,
      height: '80%',
      borderRadius: 12,
      padding: 0,
    }}>
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: colors.greyOutline,
        }}>
          <Text h4>{t('invoice.invoiceSettings')} - {eventTitle}</Text>
          <Button
            onPress={onClose}
            type="clear"
            icon={<MaterialCommunityIcons name="close" size={24} color={colors.grey2} />}
          />
        </View>
        
        <ScrollView style={{ flex: 1, padding: spacing.lg }}>
          {invoiceSettingsError && (
            <Card containerStyle={{
              backgroundColor: colors.danger + '20',
              borderColor: colors.danger,
              borderWidth: 1,
              marginBottom: spacing.md,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons 
                  name="alert-circle" 
                  size={24} 
                  color={colors.danger} 
                  style={{ marginRight: spacing.sm }}
                />
                <Text style={{ color: colors.error, flex: 1 }}>
                  {invoiceSettingsError}
                </Text>
              </View>
            </Card>
          )}

          {previewMode ? (
            <InvoicePreview 
              formData={formData} 
              eventTitle={eventTitle}
              onBackToEdit={() => setPreviewMode(false)}
            />
          ) : (
            <View>
              <Input
                label={t('invoice.companyName')}
                value={formData.companyName}
                onChangeText={(text) => handleInputChange('companyName', text)}
                placeholder={t('invoice.enterCompanyName')}
                containerStyle={{ marginBottom: spacing.md }}
              />

              <Input
                label={t('invoice.companyAddress')}
                value={formData.companyAddress}
                onChangeText={(text) => handleInputChange('companyAddress', text)}
                placeholder={t('invoice.enterCompanyAddress')}
                multiline
                numberOfLines={3}
                containerStyle={{ marginBottom: spacing.md }}
              />

              <Input
                label={t('invoice.taxNumber')}
                value={formData.taxNumber}
                onChangeText={(text) => handleInputChange('taxNumber', text)}
                placeholder={t('invoice.enterTaxNumber')}
                containerStyle={{ marginBottom: spacing.md }}
              />

              <Input
                label={t('invoice.invoicePrefix')}
                value={formData.invoicePrefix}
                onChangeText={(text) => handleInputChange('invoicePrefix', text)}
                placeholder="e.g., INV-, EVENT-"
                containerStyle={{ marginBottom: spacing.md }}
              />

              <Input
                label={t('invoice.invoiceFooter')}
                value={formData.invoiceFooter}
                onChangeText={(text) => handleInputChange('invoiceFooter', text)}
                placeholder={t('invoice.enterFooter')}
                multiline
                numberOfLines={3}
                containerStyle={{ marginBottom: spacing.md }}
              />

              <Divider style={{ marginVertical: spacing.md }} />

              <Button
                title={t('invoice.previewTemplate')}
                type="outline"
                onPress={togglePreview}
                disabled={!formData.companyName}
                containerStyle={{ marginBottom: spacing.md }}
              />
            </View>
          )}
        </ScrollView>
        
        {/* Footer */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: colors.greyOutline,
        }}>
          {invoiceSettings && !previewMode && (
            <Button
              title={t('common.delete')}
              type="outline"
              buttonStyle={{ borderColor: colors.danger }}
              titleStyle={{ color: colors.danger }}
              onPress={() => {
                Alert.alert(
                  t('invoice.confirmDelete'),
                  t('invoice.confirmDeleteMessage'),
                  [
                    { text: t('common.cancel'), style: 'cancel' },
                    { text: t('common.delete'), style: 'destructive', onPress: handleDelete },
                  ]
                );
              }}
              loading={isSaving}
              containerStyle={{ flex: 1, marginRight: spacing.sm }}
            />
          )}
          <Button
            title={t('common.cancel')}
            type="clear"
            onPress={onClose}
            containerStyle={{ 
              flex: invoiceSettings && !previewMode ? 1 : 0,
              marginHorizontal: spacing.sm 
            }}
          />
          {!previewMode && (
            <Button
              title={invoiceSettings ? t('common.update') : t('common.create')}
              onPress={handleSave}
              loading={isSaving || invoiceSettingsLoading}
              disabled={!formData.companyName}
              containerStyle={{ flex: 1, marginLeft: spacing.sm }}
            />
          )}
        </View>
      </View>
    </Overlay>
  );
};

interface InvoicePreviewProps {
  formData: CreateInvoiceSettingsRequest;
  eventTitle: string;
  onBackToEdit: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  formData,
  eventTitle,
  onBackToEdit,
}) => {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  
  return (
    <View>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
      }}>
        <Text h3>{t('invoice.invoicePreview')}</Text>
        <Button
          title={t('common.backToEdit')}
          type="clear"
          onPress={onBackToEdit}
          titleStyle={{ fontSize: 14 }}
        />
      </View>

      <Card>
        <View>
          {/* Header */}
          <View style={{
            borderBottomWidth: 2,
            borderBottomColor: colors.greyOutline,
            paddingBottom: spacing.md,
            marginBottom: spacing.md,
          }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>INVOICE</Text>
            <Text style={{ color: colors.grey2 }}>
              {formData.invoicePrefix || 'INV-'}001
            </Text>
          </View>

          {/* Company Info */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>
              {formData.companyName || 'Your Company Name'}
            </Text>
            {formData.companyAddress && (
              <Text style={{ color: colors.grey2, marginTop: spacing.xs }}>
                {formData.companyAddress}
              </Text>
            )}
            {formData.taxNumber && (
              <Text style={{ color: colors.grey2, marginTop: spacing.xs }}>
                Tax ID: {formData.taxNumber}
              </Text>
            )}
          </View>

          {/* Event Info */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={{ fontWeight: '600' }}>Event:</Text>
            <Text>{eventTitle}</Text>
          </View>

          {/* Sample Invoice Items */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={{ fontWeight: '600', marginBottom: spacing.sm }}>Invoice Details:</Text>
            <View style={{
              backgroundColor: colors.grey0,
              padding: spacing.md,
              borderRadius: 8,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <Text>Event Registration - General Admission</Text>
                <Text style={{ fontWeight: '600' }}>$50.00</Text>
              </View>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: spacing.sm,
                paddingTop: spacing.sm,
                borderTopWidth: 1,
                borderTopColor: colors.greyOutline,
              }}>
                <Text style={{ fontWeight: 'bold' }}>Total:</Text>
                <Text style={{ fontWeight: 'bold' }}>$50.00</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          {formData.invoiceFooter && (
            <View style={{
              borderTopWidth: 1,
              borderTopColor: colors.greyOutline,
              paddingTop: spacing.md,
            }}>
              <Text style={{ fontSize: 12, color: colors.grey2 }}>
                {formData.invoiceFooter}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </View>
  );
};