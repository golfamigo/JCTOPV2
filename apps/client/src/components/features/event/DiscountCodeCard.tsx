import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Share, Platform } from 'react-native';
import { Text, Badge, Button, Icon, Overlay } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { DiscountCodeResponse } from '@jctop-event/shared-types';
import { useAppTheme } from '../../../theme';
import * as Clipboard from 'expo-clipboard';

interface DiscountCodeCardProps {
  discountCode: DiscountCodeResponse;
  onEdit: (discountCode: DiscountCodeResponse) => void;
  onDelete: (discountCodeId: string) => Promise<void>;
  isLoading?: boolean;
}

const DiscountCodeCard: React.FC<DiscountCodeCardProps> = ({
  discountCode,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { colors } = useAppTheme();

  const isExpired = discountCode.expiresAt && new Date(discountCode.expiresAt) < new Date();
  
  const getTypeColor = () => {
    return discountCode.type === 'percentage' ? colors.primary : colors.success;
  };

  const getValueDisplay = () => {
    if (discountCode.type === 'percentage') {
      return `${discountCode.value}%`;
    }
    return `$${discountCode.value.toFixed(2)}`;
  };

  const getStatusColor = () => {
    if (isExpired) return colors.error;
    return colors.success;
  };

  const getStatusText = () => {
    if (isExpired) return 'Expired';
    return 'Active';
  };

  const copyToClipboard = async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(discountCode.code);
      } else {
        await Clipboard.setStringAsync(discountCode.code);
      }
      Alert.alert('Success', `Discount code "${discountCode.code}" copied to clipboard`);
    } catch (error) {
      Alert.alert('Error', 'Could not copy discount code to clipboard');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(discountCode.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting discount code:', error);
      Alert.alert('Error', 'Failed to delete discount code');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'No expiration';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <View style={[styles.card, { 
        backgroundColor: colors.card,
        borderColor: colors.grey4
      }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.codeRow}>
              <Text style={[styles.codeText, { color: colors.text }]}>
                {discountCode.code}
              </Text>
              <TouchableOpacity onPress={copyToClipboard} style={styles.iconButton}>
                <Icon
                  name="content-copy"
                  type="material"
                  color={colors.grey2}
                  size={18}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.badgeRow}>
              <Badge
                value={discountCode.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                badgeStyle={[styles.badge, { backgroundColor: getTypeColor() }]}
                textStyle={styles.badgeText}
              />
              <Badge
                value={getStatusText()}
                badgeStyle={[styles.badge, styles.statusBadge, { 
                  borderColor: getStatusColor(),
                  backgroundColor: 'transparent'
                }]}
                textStyle={[styles.badgeText, { color: getStatusColor() }]}
              />
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => onEdit(discountCode)}
              disabled={isLoading}
              style={styles.iconButton}
            >
              <Icon
                name="edit"
                type="material"
                color={colors.grey2}
                size={20}
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setShowDeleteDialog(true)}
              disabled={isLoading}
              style={styles.iconButton}
            >
              <Icon
                name="delete"
                type="material"
                color={colors.error}
                size={20}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.grey2 }]}>
              Discount Value:
            </Text>
            <Text style={[styles.detailValue, styles.discountValue, { color: colors.primary }]}>
              {getValueDisplay()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.grey2 }]}>
              Usage Count:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {discountCode.usageCount} times
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.grey2 }]}>
              Expires:
            </Text>
            <Text style={[styles.detailValue, { 
              color: isExpired ? colors.error : colors.text 
            }]}>
              {formatDate(discountCode.expiresAt)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.grey2 }]}>
              Created:
            </Text>
            <Text style={[styles.detailValue, { color: colors.grey3 }]}>
              {formatDate(discountCode.createdAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Delete Confirmation Dialog */}
      <Overlay
        isVisible={showDeleteDialog}
        onBackdropPress={() => setShowDeleteDialog(false)}
        overlayStyle={[styles.deleteDialog, { backgroundColor: colors.card }]}
      >
        <View>
          <Text h4 style={[styles.dialogTitle, { color: colors.text }]}>
            Delete Discount Code
          </Text>
          
          <Text style={[styles.dialogMessage, { color: colors.grey2 }]}>
            Are you sure you want to delete the discount code "{discountCode.code}"? 
            This action cannot be undone.
          </Text>
          
          <View style={styles.dialogButtons}>
            <Button
              title="Cancel"
              onPress={() => setShowDeleteDialog(false)}
              type="outline"
              buttonStyle={[styles.dialogButton, { borderColor: colors.grey3 }]}
              titleStyle={{ color: colors.text }}
            />
            <Button
              title="Delete"
              onPress={handleDelete}
              loading={isDeleting}
              buttonStyle={[styles.dialogButton, { backgroundColor: colors.error }]}
            />
          </View>
        </View>
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadge: {
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  details: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  discountValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteDialog: {
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  dialogTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  dialogMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  dialogButton: {
    borderRadius: 6,
    paddingHorizontal: 20,
  },
});

export default DiscountCodeCard;