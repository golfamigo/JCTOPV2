import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { Text, Icon, Button } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ExportToastProps {
  visible: boolean;
  variant: ToastVariant;
  title: string;
  message?: string;
  fileName?: string;
  filePath?: string;
  actions?: ToastAction[];
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissTime?: number; // in milliseconds
  position?: 'top' | 'bottom';
}

interface ToastInstance {
  id: string;
  props: ExportToastProps;
}

const TOAST_ICONS: Record<ToastVariant, string> = {
  success: 'check-circle',
  error: 'alert-circle',
  warning: 'alert',
  info: 'information',
};

const TOAST_COLORS: Record<ToastVariant, string> = {
  success: '#28A745',
  error: '#DC3545',
  warning: '#FFC107',
  info: '#007BFF',
};

export const ExportToast: React.FC<ExportToastProps> = ({
  visible,
  variant,
  title,
  message,
  fileName,
  filePath,
  actions = [],
  onDismiss,
  autoDismiss = true,
  dismissTime = 5000,
  position = 'bottom',
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const translateY = useRef(new Animated.Value(position === 'bottom' ? 100 : -100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (autoDismiss) {
        dismissTimer.current = setTimeout(() => {
          handleDismiss();
        }, dismissTime);
      }
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: position === 'bottom' ? 100 : -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    };
  }, [visible, autoDismiss, dismissTime, position]);

  const handleDismiss = () => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
    }
    onDismiss?.();
  };

  const handleOpenFile = async () => {
    if (!filePath) return;

    try {
      if (Platform.OS === 'web') {
        // For web, create a download link
        const fileContent = await FileSystem.readAsStringAsync(filePath);
        const blob = new Blob([fileContent]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'export.csv';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // For mobile, use sharing
        await Sharing.shareAsync(filePath, {
          UTI: '.csv',
          mimeType: 'text/csv',
        });
      }
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  };

  const handleShare = async () => {
    if (!filePath) return;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(filePath, {
          UTI: '.csv',
          mimeType: 'text/csv',
          dialogTitle: t('organizer.export.shareTitle', '分享匯出檔案'),
        });
      }
    } catch (error) {
      console.error('Failed to share file:', error);
    }
  };

  // Default actions for success variant with file
  const defaultActions: ToastAction[] = [];
  if (variant === 'success' && filePath) {
    defaultActions.push({
      label: t('organizer.export.success.open'),
      onPress: handleOpenFile,
    });
    if (Platform.OS !== 'web') {
      defaultActions.push({
        label: t('organizer.export.success.share'),
        onPress: handleShare,
      });
    }
  }

  const finalActions = actions.length > 0 ? actions : defaultActions;

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          [position]: 20,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handleDismiss}
        style={[
          styles.toast,
          {
            backgroundColor: theme.colors.background,
            borderLeftColor: TOAST_COLORS[variant],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
        ]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <Icon
              name={TOAST_ICONS[variant]}
              type="material-community"
              size={24}
              color={TOAST_COLORS[variant]}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.colors.black }]}>
              {title}
            </Text>
            {message && (
              <Text style={[styles.message, { color: theme.colors.grey3 }]}>
                {message}
              </Text>
            )}
            {fileName && (
              <Text style={[styles.fileName, { color: theme.colors.grey5 }]} numberOfLines={1}>
                {fileName}
              </Text>
            )}
          </View>

          <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
            <Icon
              name="close"
              type="material-community"
              size={20}
              color={theme.colors.grey3}
            />
          </TouchableOpacity>
        </View>

        {finalActions.length > 0 && (
          <View style={[styles.actionsContainer, { borderTopColor: theme.colors.grey5 }]}>
            {finalActions.map((action, index) => (
              <Button
                key={index}
                title={action.label}
                type="clear"
                size="sm"
                onPress={() => {
                  action.onPress();
                  handleDismiss();
                }}
                titleStyle={{
                  color: TOAST_COLORS[variant],
                  fontSize: 14,
                }}
                buttonStyle={{
                  paddingHorizontal: theme.spacing.sm,
                }}
              />
            ))}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Toast Manager for stacking multiple toasts
class ToastManager {
  private static instance: ToastManager;
  private toasts: ToastInstance[] = [];
  private listeners: ((toasts: ToastInstance[]) => void)[] = [];

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  show(props: Omit<ExportToastProps, 'visible'>) {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastInstance = {
      id,
      props: { ...props, visible: true },
    };
    this.toasts.push(toast);
    this.notifyListeners();
    return id;
  }

  hide(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notifyListeners();
  }

  hideAll() {
    this.toasts = [];
    this.notifyListeners();
  }

  subscribe(listener: (toasts: ToastInstance[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }
}

export const showExportToast = (props: Omit<ExportToastProps, 'visible'>) => {
  return ToastManager.getInstance().show(props);
};

export const hideExportToast = (id: string) => {
  ToastManager.getInstance().hide(id);
};

export const hideAllToasts = () => {
  ToastManager.getInstance().hideAll();
};

// Hook to use toast manager
export const useExportToast = () => {
  const [toasts, setToasts] = useState<ToastInstance[]>([]);

  useEffect(() => {
    const unsubscribe = ToastManager.getInstance().subscribe(setToasts);
    return unsubscribe;
  }, []);

  return {
    toasts,
    show: showExportToast,
    hide: hideExportToast,
    hideAll: hideAllToasts,
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    borderRadius: 8,
    borderLeftWidth: 4,
    minHeight: 80,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    marginTop: 2,
  },
  fileName: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  closeButton: {
    padding: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
});