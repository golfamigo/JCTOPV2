import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dialog, Text, Button, Icon } from '@rneui/themed';
import { useAppTheme } from '@/theme';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

export default function ConfirmationDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning',
}: ConfirmationDialogProps) {
  const { colors, spacing } = useAppTheme();
  const [loading, setLoading] = useState(false);

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return colors.danger;
      case 'warning':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const getIconName = () => {
    switch (type) {
      case 'danger':
        return 'alert-circle';
      case 'warning':
        return 'alert';
      default:
        return 'information';
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isVisible={visible}
      onBackdropPress={loading ? undefined : onCancel}
      overlayStyle={styles.dialogContainer}
    >
      <View style={styles.iconContainer}>
        <Icon
          name={getIconName()}
          type="material-community"
          size={48}
          color={getIconColor()}
        />
      </View>

      <Dialog.Title title={title} titleStyle={styles.title} />
      
      <Text style={styles.message}>{message}</Text>

      <Dialog.Actions>
        <View style={styles.actionsContainer}>
          <Button
            title={cancelText}
            onPress={onCancel}
            type="outline"
            disabled={loading}
            buttonStyle={[styles.button, styles.cancelButton]}
            titleStyle={styles.cancelButtonText}
          />
          <Button
            title={confirmText}
            onPress={handleConfirm}
            loading={loading}
            disabled={loading}
            buttonStyle={[
              styles.button,
              styles.confirmButton,
              { backgroundColor: getIconColor() },
            ]}
          />
        </View>
      </Dialog.Actions>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  dialogContainer: {
    borderRadius: 12,
    padding: 20,
    maxWidth: 400,
    width: '90%',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
  },
  cancelButton: {
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
  },
  confirmButton: {
    // Background color is set dynamically
  },
});