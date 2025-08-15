import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Share } from 'react-native';
import { 
  Card, 
  Text, 
  ListItem, 
  Badge, 
  Button,
  Icon,
  Skeleton,
  Divider,
  Input,
  Overlay
} from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '@/theme';

// Extended Invoice interface for details
interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InvoiceDetails {
  id: string;
  invoiceNumber: string;
  eventId: string;
  eventName: string;
  recipientEmail: string;
  recipientName: string;
  recipientAddress?: string;
  recipientPhone?: string;
  amount: number;
  subtotal: number;
  taxAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: string;
  sentAt?: string;
  paidAt?: string;
  dueDate: string;
  notes?: string;
  lineItems: InvoiceLineItem[];
  companyInfo: {
    name: string;
    address: string;
    taxNumber: string;
    phone?: string;
    email?: string;
  };
}

const InvoiceDetailsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<InvoiceDetails>>({});
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Mock data for development - replace with actual service calls
  const mockInvoiceDetails: InvoiceDetails = {
    id: invoiceId,
    invoiceNumber: `INV-${invoiceId.padStart(3, '0')}`,
    eventId: 'event-123',
    eventName: 'Tech Conference 2024',
    recipientEmail: 'john@example.com',
    recipientName: 'John Doe',
    recipientAddress: '123 Main St, Taipei, Taiwan 10001',
    recipientPhone: '+886-2-1234-5678',
    amount: 1500,
    subtotal: 1363.64,
    taxAmount: 136.36,
    status: 'sent',
    createdAt: '2024-01-10T10:00:00Z',
    sentAt: '2024-01-10T11:00:00Z',
    dueDate: '2024-02-10T00:00:00Z',
    notes: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
    lineItems: [
      {
        id: '1',
        description: 'General Admission Ticket',
        quantity: 2,
        unitPrice: 500,
        totalPrice: 1000,
      },
      {
        id: '2',
        description: 'Workshop Add-on',
        quantity: 1,
        unitPrice: 300,
        totalPrice: 300,
      },
      {
        id: '3',
        description: 'Networking Lunch',
        quantity: 2,
        unitPrice: 150,
        totalPrice: 300,
      },
    ],
    companyInfo: {
      name: 'Event Organizers Ltd.',
      address: '456 Business Ave, Taipei, Taiwan 10045',
      taxNumber: '12345678',
      phone: '+886-2-9876-5432',
      email: 'billing@eventorganizers.com',
    },
  };

  useEffect(() => {
    loadInvoiceDetails();
  }, [invoiceId]);

  const loadInvoiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Replace with actual service call:
      // const data = await invoiceService.getInvoiceDetails(invoiceId);
      setInvoice(mockInvoiceDetails);
      setEditForm(mockInvoiceDetails);
    } catch (err: any) {
      setError(err.message || t('errors.networkError'));
    } finally {
      setLoading(false);
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      // Replace with actual service call:
      // await invoiceService.updateInvoice(invoiceId, editForm);
      
      setInvoice({ ...invoice!, ...editForm });
      setIsEditing(false);
      
      Alert.alert(t('common.success'), t('invoice.invoiceUpdated'));
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('invoice.updateFailed'));
    }
  };

  const handleCancelEdit = () => {
    setEditForm(invoice!);
    setIsEditing(false);
  };

  const handleSendInvoice = () => {
    Alert.alert(
      t('invoice.sendInvoice'),
      t('invoice.confirmSend', { number: invoice!.invoiceNumber }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('invoice.sendInvoice'), 
          onPress: async () => {
            try {
              // Replace with actual service call:
              // await invoiceService.sendInvoice(invoiceId);
              
              const updatedInvoice = { 
                ...invoice!, 
                status: 'sent' as const, 
                sentAt: new Date().toISOString() 
              };
              setInvoice(updatedInvoice);
              
              Alert.alert(t('common.success'), t('invoice.invoiceSent'));
            } catch (err: any) {
              Alert.alert(t('common.error'), err.message || t('invoice.sendFailed'));
            }
          }
        },
      ]
    );
  };

  const handleDeleteInvoice = () => {
    Alert.alert(
      t('invoice.deleteInvoice'),
      t('invoice.confirmDeleteInvoice', { number: invoice!.invoiceNumber }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              // Replace with actual service call:
              // await invoiceService.deleteInvoice(invoiceId);
              
              Alert.alert(t('common.success'), t('invoice.invoiceDeleted'), [
                { text: t('common.ok'), onPress: () => router.back() }
              ]);
            } catch (err: any) {
              Alert.alert(t('common.error'), err.message || t('invoice.deleteFailed'));
            }
          }
        },
      ]
    );
  };

  const handleShareInvoice = async () => {
    try {
      const shareUrl = `https://app.example.com/invoices/${invoiceId}`;
      await Share.share({
        message: t('invoice.shareMessage', { 
          number: invoice!.invoiceNumber, 
          amount: formatCurrency(invoice!.amount),
          url: shareUrl 
        }),
        url: shareUrl,
        title: t('invoice.shareTitle', { number: invoice!.invoiceNumber }),
      });
    } catch (err: any) {
      Alert.alert(t('common.error'), t('invoice.shareFailed'));
    }
  };

  const handlePreviewPDF = () => {
    setShowPdfPreview(true);
  };

  const handleDownloadPDF = async () => {
    try {
      // Replace with actual PDF generation/download:
      // await invoiceService.downloadInvoicePDF(invoiceId);
      Alert.alert(t('common.success'), t('invoice.pdfDownloaded'));
    } catch (err: any) {
      Alert.alert(t('common.error'), t('invoice.downloadFailed'));
    }
  };

  if (loading) {
    return (
      <ScrollView style={styles.container}>
        <Card containerStyle={styles.card}>
          <Skeleton animation="pulse" width={180} height={20} style={styles.skeletonItem} />
          <Skeleton animation="pulse" width={120} height={16} style={styles.skeletonItem} />
          <Skeleton animation="pulse" width={250} height={16} style={styles.skeletonItem} />
          <Skeleton animation="pulse" width={200} height={16} />
        </Card>
        
        {[...Array(3)].map((_, index) => (
          <Card key={index} containerStyle={styles.card}>
            <Skeleton animation="pulse" width={300} height={120} />
          </Card>
        ))}
      </ScrollView>
    );
  }

  if (error || !invoice) {
    return (
      <View style={styles.errorContainer}>
        <Icon
          name="alert-circle-outline"
          type="material-community"
          size={48}
          color={colors.error}
          style={{ marginBottom: spacing.md }}
        />
        <Text style={[typography.h3, styles.errorTitle]}>
          {t('common.error')}
        </Text>
        <Text style={[typography.body, styles.errorDescription, { color: colors.grey2 }]}>
          {error || t('invoice.invoiceNotFound')}
        </Text>
        <Button
          title={t('common.retry')}
          onPress={loadInvoiceDetails}
          buttonStyle={styles.retryButton}
          containerStyle={styles.retryButtonContainer}
        />
      </View>
    );
  }

  const badgeProps = getStatusBadgeProps(invoice.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Button
            onPress={() => router.back()}
            type="clear"
            icon={
              <MaterialCommunityIcons 
                name="arrow-left" 
                size={24} 
                color={colors.primary} 
              />
            }
          />
          <View style={styles.headerInfo}>
            <Text h3 style={styles.invoiceNumber}>
              {invoice.invoiceNumber}
            </Text>
            <Badge {...badgeProps} badgeStyle={styles.statusBadge} />
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <Button
            onPress={handleShareInvoice}
            type="clear"
            icon={
              <MaterialCommunityIcons 
                name="share-variant" 
                size={24} 
                color={colors.primary} 
              />
            }
          />
          <Button
            onPress={isEditing ? handleSaveEdit : handleEdit}
            type="clear"
            icon={
              <MaterialCommunityIcons 
                name={isEditing ? "check" : "pencil"} 
                size={24} 
                color={colors.primary} 
              />
            }
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Invoice Details */}
        <Card containerStyle={styles.card}>
          <Text h4 style={styles.sectionTitle}>
            {t('invoice.invoiceDetails')}
          </Text>
          
          <ListItem containerStyle={styles.listItem}>
            <MaterialCommunityIcons name="calendar" size={20} color={colors.grey2} />
            <ListItem.Content>
              <ListItem.Title>{t('invoice.createdDate')}</ListItem.Title>
              <ListItem.Subtitle>{formatDate(invoice.createdAt)}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>

          {invoice.sentAt && (
            <ListItem containerStyle={styles.listItem}>
              <MaterialCommunityIcons name="send" size={20} color={colors.grey2} />
              <ListItem.Content>
                <ListItem.Title>{t('invoice.sentDate')}</ListItem.Title>
                <ListItem.Subtitle>{formatDate(invoice.sentAt)}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          )}

          {invoice.paidAt && (
            <ListItem containerStyle={styles.listItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
              <ListItem.Content>
                <ListItem.Title>{t('invoice.paidDate')}</ListItem.Title>
                <ListItem.Subtitle>{formatDate(invoice.paidAt)}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          )}

          <ListItem containerStyle={styles.listItem}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.grey2} />
            <ListItem.Content>
              <ListItem.Title>{t('invoice.dueDate')}</ListItem.Title>
              <ListItem.Subtitle>{formatDate(invoice.dueDate)}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        </Card>

        {/* Recipient Information */}
        <Card containerStyle={styles.card}>
          <Text h4 style={styles.sectionTitle}>
            {t('invoice.recipientInfo')}
          </Text>
          
          {isEditing ? (
            <View>
              <Input
                label={t('invoice.recipientName')}
                value={editForm.recipientName}
                onChangeText={(text) => setEditForm({ ...editForm, recipientName: text })}
                containerStyle={styles.inputContainer}
              />
              <Input
                label={t('invoice.recipientEmail')}
                value={editForm.recipientEmail}
                onChangeText={(text) => setEditForm({ ...editForm, recipientEmail: text })}
                containerStyle={styles.inputContainer}
              />
              <Input
                label={t('invoice.recipientAddress')}
                value={editForm.recipientAddress}
                onChangeText={(text) => setEditForm({ ...editForm, recipientAddress: text })}
                multiline
                numberOfLines={2}
                containerStyle={styles.inputContainer}
              />
            </View>
          ) : (
            <View>
              <ListItem containerStyle={styles.listItem}>
                <MaterialCommunityIcons name="account" size={20} color={colors.grey2} />
                <ListItem.Content>
                  <ListItem.Title>{t('invoice.recipientName')}</ListItem.Title>
                  <ListItem.Subtitle>{invoice.recipientName}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>

              <ListItem containerStyle={styles.listItem}>
                <MaterialCommunityIcons name="email" size={20} color={colors.grey2} />
                <ListItem.Content>
                  <ListItem.Title>{t('invoice.recipientEmail')}</ListItem.Title>
                  <ListItem.Subtitle>{invoice.recipientEmail}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>

              {invoice.recipientAddress && (
                <ListItem containerStyle={styles.listItem}>
                  <MaterialCommunityIcons name="map-marker" size={20} color={colors.grey2} />
                  <ListItem.Content>
                    <ListItem.Title>{t('invoice.recipientAddress')}</ListItem.Title>
                    <ListItem.Subtitle>{invoice.recipientAddress}</ListItem.Subtitle>
                  </ListItem.Content>
                </ListItem>
              )}
            </View>
          )}
        </Card>

        {/* Line Items */}
        <Card containerStyle={styles.card}>
          <Text h4 style={styles.sectionTitle}>
            {t('invoice.lineItems')}
          </Text>
          
          {invoice.lineItems.map((item, index) => (
            <ListItem key={item.id} containerStyle={styles.lineItem}>
              <ListItem.Content>
                <View style={styles.lineItemHeader}>
                  <Text style={typography.body}>{item.description}</Text>
                  <Text style={[typography.body, { fontWeight: '600' }]}>
                    {formatCurrency(item.totalPrice)}
                  </Text>
                </View>
                <Text style={[typography.small, { color: colors.grey2 }]}>
                  {t('invoice.quantity')}: {item.quantity} × {formatCurrency(item.unitPrice)}
                </Text>
              </ListItem.Content>
            </ListItem>
          ))}

          <Divider style={styles.divider} />

          <View style={styles.totalSection}>
            <View style={styles.totalLine}>
              <Text style={typography.body}>{t('invoice.subtotal')}</Text>
              <Text style={typography.body}>{formatCurrency(invoice.subtotal)}</Text>
            </View>
            
            <View style={styles.totalLine}>
              <Text style={typography.body}>{t('invoice.tax')}</Text>
              <Text style={typography.body}>{formatCurrency(invoice.taxAmount)}</Text>
            </View>
            
            <View style={[styles.totalLine, styles.grandTotalLine]}>
              <Text style={[typography.h4, { color: colors.primary }]}>
                {t('invoice.total')}
              </Text>
              <Text style={[typography.h4, { color: colors.primary }]}>
                {formatCurrency(invoice.amount)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Company Information */}
        <Card containerStyle={styles.card}>
          <Text h4 style={styles.sectionTitle}>
            {t('invoice.companyInfo')}
          </Text>
          
          <ListItem containerStyle={styles.listItem}>
            <ListItem.Content>
              <ListItem.Title style={{ fontWeight: '600' }}>
                {invoice.companyInfo.name}
              </ListItem.Title>
              <ListItem.Subtitle>{invoice.companyInfo.address}</ListItem.Subtitle>
              <ListItem.Subtitle>
                {t('invoice.taxNumber')}: {invoice.companyInfo.taxNumber}
              </ListItem.Subtitle>
              {invoice.companyInfo.phone && (
                <ListItem.Subtitle>{invoice.companyInfo.phone}</ListItem.Subtitle>
              )}
              {invoice.companyInfo.email && (
                <ListItem.Subtitle>{invoice.companyInfo.email}</ListItem.Subtitle>
              )}
            </ListItem.Content>
          </ListItem>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card containerStyle={styles.card}>
            <Text h4 style={styles.sectionTitle}>
              {t('invoice.notes')}
            </Text>
            <Text style={[typography.body, { color: colors.grey2 }]}>
              {invoice.notes}
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {!isEditing && (
        <View style={styles.actionButtons}>
          <Button
            title={t('invoice.previewPDF')}
            type="outline"
            onPress={handlePreviewPDF}
            icon={
              <MaterialCommunityIcons 
                name="file-pdf-box" 
                size={20} 
                color={colors.primary} 
                style={{ marginRight: spacing.xs }}
              />
            }
            containerStyle={styles.actionButton}
          />
          
          <Button
            title={t('invoice.downloadPDF')}
            type="outline"
            onPress={handleDownloadPDF}
            icon={
              <MaterialCommunityIcons 
                name="download" 
                size={20} 
                color={colors.primary} 
                style={{ marginRight: spacing.xs }}
              />
            }
            containerStyle={styles.actionButton}
          />

          {invoice.status === 'draft' && (
            <Button
              title={t('invoice.sendInvoice')}
              onPress={handleSendInvoice}
              icon={
                <MaterialCommunityIcons 
                  name="send" 
                  size={20} 
                  color={colors.white} 
                  style={{ marginRight: spacing.xs }}
                />
              }
              containerStyle={styles.actionButton}
            />
          )}

          <Button
            title={t('common.delete')}
            type="outline"
            onPress={handleDeleteInvoice}
            buttonStyle={{ borderColor: colors.error }}
            titleStyle={{ color: colors.error }}
            icon={
              <MaterialCommunityIcons 
                name="delete" 
                size={20} 
                color={colors.error} 
                style={{ marginRight: spacing.xs }}
              />
            }
            containerStyle={styles.actionButton}
          />
        </View>
      )}

      {isEditing && (
        <View style={styles.editActions}>
          <Button
            title={t('common.cancel')}
            type="outline"
            onPress={handleCancelEdit}
            containerStyle={styles.editButton}
          />
          <Button
            title={t('common.save')}
            onPress={handleSaveEdit}
            containerStyle={styles.editButton}
          />
        </View>
      )}

      {/* PDF Preview Modal */}
      <Overlay 
        isVisible={showPdfPreview} 
        onBackdropPress={() => setShowPdfPreview(false)}
        overlayStyle={styles.pdfOverlay}
      >
        <View style={styles.pdfPreviewContainer}>
          <View style={styles.pdfHeader}>
            <Text h4>{t('invoice.pdfPreview')}</Text>
            <Button
              onPress={() => setShowPdfPreview(false)}
              type="clear"
              icon={
                <MaterialCommunityIcons name="close" size={24} color={colors.grey2} />
              }
            />
          </View>
          
          <View style={styles.pdfContent}>
            <Text style={{ textAlign: 'center', color: colors.grey2, marginTop: spacing.xl }}>
              {t('invoice.pdfPreviewPlaceholder')}
            </Text>
          </View>
          
          <View style={styles.pdfActions}>
            <Button
              title={t('invoice.downloadPDF')}
              onPress={handleDownloadPDF}
              icon={
                <MaterialCommunityIcons 
                  name="download" 
                  size={20} 
                  color={colors.white} 
                  style={{ marginRight: spacing.xs }}
                />
              }
            />
          </View>
        </View>
      </Overlay>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  invoiceNumber: {
    marginRight: 12,
  },
  statusBadge: {
    // Badge styling handled by component
  },
  headerActions: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    borderRadius: 12,
    shadowColor: '#212529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#212529',
  },
  listItem: {
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  inputContainer: {
    marginBottom: 8,
  },
  lineItem: {
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  lineItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
  },
  totalSection: {
    paddingTop: 8,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  grandTotalLine: {
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  actionButtons: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  actionButton: {
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    gap: 8,
  },
  editButton: {
    flex: 1,
  },
  pdfOverlay: {
    width: '90%',
    height: '80%',
    borderRadius: 12,
    padding: 0,
  },
  pdfPreviewContainer: {
    flex: 1,
  },
  pdfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  pdfContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  skeletonItem: {
    marginBottom: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDescription: {
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  retryButtonContainer: {
    width: '100%',
  },
});

export default InvoiceDetailsScreen;