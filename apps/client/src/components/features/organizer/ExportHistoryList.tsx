import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Alert, Platform } from 'react-native';
import { ListItem, Text, Icon, Button, Avatar } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface ExportHistoryItem {
  id: string;
  fileName: string;
  format: 'csv' | 'excel' | 'pdf';
  dataTypes: string[];
  exportDate: string;
  fileSize: number;
  filePath?: string;
  status: 'success' | 'failed' | 'expired';
  eventName?: string;
}

interface ExportHistoryListProps {
  maxItems?: number;
  onRedownload?: (item: ExportHistoryItem) => Promise<void>;
  onDelete?: (item: ExportHistoryItem) => void;
}

const STORAGE_KEY = 'export_history';
const MAX_HISTORY_ITEMS = 50;
const FILE_EXPIRY_DAYS = 7;

const FORMAT_ICONS: Record<string, string> = {
  csv: 'file-delimited',
  excel: 'microsoft-excel',
  pdf: 'file-pdf-box',
};

const FORMAT_COLORS: Record<string, string> = {
  csv: '#4CAF50',
  excel: '#217346',
  pdf: '#DC3545',
};

export const ExportHistoryList: React.FC<ExportHistoryListProps> = ({
  maxItems = 10,
  onRedownload,
  onDelete,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [history, setHistory] = useState<ExportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items: ExportHistoryItem[] = JSON.parse(stored);
        // Check for expired items
        const now = new Date();
        const validItems = items.map(item => {
          const exportDate = new Date(item.exportDate);
          const daysSinceExport = (now.getTime() - exportDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceExport > FILE_EXPIRY_DAYS && item.status === 'success') {
            return { ...item, status: 'expired' as const };
          }
          return item;
        });
        setHistory(validItems.slice(0, maxItems));
        // Save updated items with expired status
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validItems));
      }
    } catch (error) {
      console.error('Failed to load export history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDelete = async (item: ExportHistoryItem) => {
    Alert.alert(
      t('organizer.export.history.deleteTitle', '刪除記錄'),
      t('organizer.export.history.deleteMessage', '確定要刪除此匯出記錄嗎？'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete file if it exists
              if (item.filePath) {
                const fileInfo = await FileSystem.getInfoAsync(item.filePath);
                if (fileInfo.exists) {
                  await FileSystem.deleteAsync(item.filePath);
                }
              }

              // Update history
              const newHistory = history.filter(h => h.id !== item.id);
              setHistory(newHistory);
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
              
              onDelete?.(item);
            } catch (error) {
              console.error('Failed to delete history item:', error);
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      t('organizer.export.history.clearAll'),
      t('organizer.export.history.confirmClear'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('organizer.export.history.clearAll'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all files
              for (const item of history) {
                if (item.filePath) {
                  try {
                    const fileInfo = await FileSystem.getInfoAsync(item.filePath);
                    if (fileInfo.exists) {
                      await FileSystem.deleteAsync(item.filePath);
                    }
                  } catch (error) {
                    console.error(`Failed to delete file ${item.filePath}:`, error);
                  }
                }
              }

              // Clear history
              setHistory([]);
              await AsyncStorage.removeItem(STORAGE_KEY);
            } catch (error) {
              console.error('Failed to clear history:', error);
            }
          },
        },
      ]
    );
  };

  const handleRedownload = async (item: ExportHistoryItem) => {
    if (onRedownload) {
      setLoading(true);
      try {
        await onRedownload(item);
        await loadHistory(); // Reload to show updated item
      } catch (error) {
        Alert.alert(
          t('common.error'),
          t('organizer.export.history.redownloadFailed', '重新下載失敗')
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleShare = async (item: ExportHistoryItem) => {
    if (!item.filePath) return;

    try {
      const fileInfo = await FileSystem.getInfoAsync(item.filePath);
      if (!fileInfo.exists) {
        Alert.alert(
          t('common.error'),
          t('organizer.export.history.fileNotFound', '檔案不存在')
        );
        return;
      }

      if (Platform.OS === 'web') {
        // For web, create download link
        const fileContent = await FileSystem.readAsStringAsync(item.filePath);
        const blob = new Blob([fileContent]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.fileName;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // For mobile, use sharing
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(item.filePath, {
            mimeType: item.format === 'pdf' ? 'application/pdf' : 
                     item.format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv',
            dialogTitle: t('organizer.export.shareTitle', '分享匯出檔案'),
          });
        }
      }
    } catch (error) {
      console.error('Failed to share file:', error);
      Alert.alert(
        t('common.error'),
        t('organizer.export.shareFailed', '分享失敗')
      );
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return t('organizer.export.history.minutesAgo', '{{count}} 分鐘前', { count: diffMinutes });
    }
    if (diffHours < 24) {
      return t('organizer.export.history.hoursAgo', '{{count}} 小時前', { count: Math.floor(diffHours) });
    }
    if (diffHours < 48) {
      return t('organizer.export.history.yesterday', '昨天');
    }
    
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDataTypeLabels = (dataTypes: string[]): string => {
    return dataTypes
      .map(type => t(`organizer.export.options.${type}`))
      .join(', ');
  };

  if (loading) {
    return (
      <View style={{ padding: theme.spacing.lg, alignItems: 'center' }}>
        <Text>{t('common.loading')}</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={{ padding: theme.spacing.lg, alignItems: 'center' }}>
        <Icon
          name="history"
          type="material-community"
          size={48}
          color={theme.colors.grey3}
        />
        <Text style={{ marginTop: theme.spacing.md, color: theme.colors.grey3 }}>
          {t('organizer.export.history.empty')}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
        }}
      >
        <Text h4>{t('organizer.export.history.title')}</Text>
        {history.length > 0 && (
          <Button
            title={t('organizer.export.history.clearAll')}
            type="clear"
            size="sm"
            onPress={handleClearAll}
            titleStyle={{ color: theme.colors.error }}
          />
        )}
      </View>

      <ScrollView>
        {history.map((item, index) => (
          <ListItem.Swipeable
            key={item.id}
            bottomDivider
            onPress={() => handleToggleExpand(item.id)}
            rightContent={
              <Button
                title={t('common.delete')}
                icon={{ name: 'delete', color: 'white' }}
                buttonStyle={{ minHeight: '100%', backgroundColor: theme.colors.error }}
                onPress={() => handleDelete(item)}
              />
            }
          >
            <Avatar
              rounded
              icon={{
                name: FORMAT_ICONS[item.format],
                type: 'material-community',
                color: FORMAT_COLORS[item.format],
              }}
              containerStyle={{ backgroundColor: theme.colors.grey5 }}
            />
            <ListItem.Content>
              <ListItem.Title style={{ fontWeight: '600' }}>
                {item.fileName}
              </ListItem.Title>
              <ListItem.Subtitle style={{ fontSize: 12, color: theme.colors.grey3 }}>
                {formatDate(item.exportDate)} • {formatFileSize(item.fileSize)}
              </ListItem.Subtitle>
              {expandedItems.has(item.id) && (
                <View style={{ marginTop: theme.spacing.sm }}>
                  <Text style={{ fontSize: 12, color: theme.colors.grey3 }}>
                    {t('organizer.export.dataTypes', '資料類型')}: {getDataTypeLabels(item.dataTypes)}
                  </Text>
                  {item.eventName && (
                    <Text style={{ fontSize: 12, color: theme.colors.grey3 }}>
                      {t('events.eventName')}: {item.eventName}
                    </Text>
                  )}
                  <View style={{ flexDirection: 'row', marginTop: theme.spacing.sm }}>
                    {item.status === 'success' && (
                      <Button
                        title={Platform.OS === 'web' ? t('common.download', '下載') : t('common.share')}
                        type="outline"
                        size="sm"
                        onPress={() => handleShare(item)}
                        buttonStyle={{ marginRight: theme.spacing.sm }}
                      />
                    )}
                    {item.status === 'expired' && onRedownload && (
                      <Button
                        title={t('organizer.export.history.redownload')}
                        type="outline"
                        size="sm"
                        onPress={() => handleRedownload(item)}
                      />
                    )}
                  </View>
                </View>
              )}
            </ListItem.Content>
            <ListItem.Chevron
              iconProps={{
                name: expandedItems.has(item.id) ? 'chevron-up' : 'chevron-down',
              } as any}
            />
          </ListItem.Swipeable>
        ))}
      </ScrollView>
    </View>
  );
};

// Helper function to add item to history
export const addToExportHistory = async (item: Omit<ExportHistoryItem, 'id'>) => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const history: ExportHistoryItem[] = stored ? JSON.parse(stored) : [];
    
    const newItem: ExportHistoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
    };

    // Add new item at the beginning
    history.unshift(newItem);

    // Keep only MAX_HISTORY_ITEMS
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
    return newItem;
  } catch (error) {
    console.error('Failed to add to export history:', error);
    throw error;
  }
};