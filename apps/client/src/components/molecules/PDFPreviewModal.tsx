import React, { useState } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import { Overlay, Text, Button, Card } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';

interface PDFPreviewModalProps {
  isVisible: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  onDownload?: () => void;
  onShare?: () => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isVisible,
  onClose,
  invoiceId,
  invoiceNumber,
  onDownload,
  onShare,
}) => {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();
  const [loading, setLoading] = useState(false);

  const windowDimensions = Dimensions.get('window');
  const isTablet = windowDimensions.width >= 768;

  const handleDownload = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would:
      // 1. Generate PDF on backend
      // 2. Download PDF file
      // 3. Save to device storage
      
      if (onDownload) {
        await onDownload();
      } else {
        // Placeholder implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        Alert.alert(t('common.success'), t('invoice.pdfDownloaded'));
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('invoice.downloadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (onShare) {
        await onShare();
      } else {
        Alert.alert(t('common.comingSoon'), t('invoice.shareComingSoon'));
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('invoice.shareFailed'));
    }
  };

  return (
    <Overlay 
      isVisible={isVisible} 
      onBackdropPress={onClose}
      overlayStyle={[
        styles.overlay,
        {
          width: isTablet ? '80%' : '95%',
          height: isTablet ? '85%' : '90%',
        }
      ]}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.greyOutline }]}>
          <View style={styles.headerLeft}>
            <Text h4 style={styles.headerTitle}>
              {t('invoice.pdfPreview')}
            </Text>
            <Text style={[typography.small, { color: colors.grey2, marginTop: spacing.xs }]}>
              {invoiceNumber}
            </Text>
          </View>
          <Button
            onPress={onClose}
            type="clear"
            icon={
              <MaterialCommunityIcons 
                name="close" 
                size={24} 
                color={colors.grey2} 
              />
            }
          />
        </View>

        {/* PDF Preview Content */}
        <View style={styles.content}>
          <Card containerStyle={styles.previewCard}>
            <View style={styles.placeholderContainer}>
              <MaterialCommunityIcons 
                name="file-pdf-box" 
                size={80} 
                color={colors.grey2} 
                style={styles.placeholderIcon}
              />
              <Text style={[typography.h3, styles.placeholderTitle]}>
                {t('invoice.pdfPreviewPlaceholder')}
              </Text>
              <Text style={[typography.body, styles.placeholderDescription, { color: colors.grey2 }]}>
                {t('invoice.pdfPreviewDescription')}
              </Text>
              
              {/* Mock PDF Content Preview */}
              <View style={styles.mockPdfContent}>
                <View style={[styles.mockPdfHeader, { borderBottomColor: colors.greyOutline }]}>
                  <Text style={[typography.h4, { color: colors.primary }]}>
                    INVOICE
                  </Text>
                  <Text style={[typography.small, { color: colors.grey2 }]}>
                    {invoiceNumber}
                  </Text>
                </View>
                
                <View style={styles.mockPdfBody}>
                  <View style={styles.mockPdfRow}>
                    <Text style={typography.small}>Invoice Date:</Text>
                    <Text style={typography.small}>2024/01/10</Text>
                  </View>
                  <View style={styles.mockPdfRow}>
                    <Text style={typography.small}>Due Date:</Text>
                    <Text style={typography.small}>2024/02/10</Text>
                  </View>
                  <View style={[styles.mockPdfRow, { marginTop: spacing.md }]}>
                    <Text style={[typography.body, { fontWeight: '600' }]}>Total Amount:</Text>
                    <Text style={[typography.body, { fontWeight: '600', color: colors.primary }]}>
                      NT$ 1,500
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actions, { borderTopColor: colors.greyOutline }]}>
          <View style={styles.actionRow}>
            <Button
              title={t('invoice.downloadPDF')}
              onPress={handleDownload}
              loading={loading}
              icon={
                <MaterialCommunityIcons 
                  name="download" 
                  size={20} 
                  color={colors.white} 
                  style={{ marginRight: spacing.xs }}
                />
              }
              containerStyle={styles.actionButton}
              buttonStyle={{ backgroundColor: colors.primary }}
            />
            
            <Button
              title={t('common.share')}
              type="outline"
              onPress={handleShare}
              icon={
                <MaterialCommunityIcons 
                  name="share-variant" 
                  size={20} 
                  color={colors.primary} 
                  style={{ marginRight: spacing.xs }}
                />
              }
              containerStyle={styles.actionButton}
              buttonStyle={{ borderColor: colors.primary }}
              titleStyle={{ color: colors.primary }}
            />
          </View>
          
          <Button
            title={t('common.close')}
            type="clear"
            onPress={onClose}
            containerStyle={styles.closeButton}
            titleStyle={{ color: colors.grey2 }}
          />
        </View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    borderRadius: 12,
    padding: 0,
    margin: 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    marginBottom: 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  previewCard: {
    flex: 1,
    margin: 0,
    borderRadius: 8,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  placeholderIcon: {
    marginBottom: 16,
  },
  placeholderTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderDescription: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  mockPdfContent: {
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  mockPdfHeader: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  mockPdfBody: {
    gap: 8,
  },
  mockPdfRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
  },
  closeButton: {
    width: '100%',
  },
});

export default PDFPreviewModal;