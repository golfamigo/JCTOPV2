import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { useAppTheme } from '@/theme';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  iconType?: string;
  iconSize?: number;
  iconColor?: string;
  illustration?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'compact' | 'large';
}

/**
 * Reusable empty state component for displaying when no data is available
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  iconType = 'feather',
  iconSize = 64,
  iconColor,
  illustration,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
  variant = 'default',
}) => {
  const theme = useAppTheme();
  
  const getContainerStyle = () => {
    switch (variant) {
      case 'compact':
        return styles.compactContainer;
      case 'large':
        return styles.largeContainer;
      default:
        return styles.container;
    }
  };
  
  const getTitleStyle = () => {
    switch (variant) {
      case 'compact':
        return styles.compactTitle;
      case 'large':
        return styles.largeTitle;
      default:
        return styles.title;
    }
  };
  
  const getDescriptionStyle = () => {
    switch (variant) {
      case 'compact':
        return styles.compactDescription;
      case 'large':
        return styles.largeDescription;
      default:
        return styles.description;
    }
  };

  return (
    <View style={[getContainerStyle(), style]}>
      {/* Illustration or Icon */}
      {illustration ? (
        <View style={styles.illustrationContainer}>{illustration}</View>
      ) : icon ? (
        <View style={styles.iconContainer}>
          <Icon
            name={icon}
            type={iconType}
            size={variant === 'compact' ? 48 : iconSize}
            color={iconColor || theme.colors.grey3}
          />
        </View>
      ) : null}

      {/* Title */}
      <Text style={[getTitleStyle(), { color: theme.colors.grey1 }]}>
        {title}
      </Text>

      {/* Description */}
      {description && (
        <Text style={[getDescriptionStyle(), { color: theme.colors.grey3 }]}>
          {description}
        </Text>
      )}

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actionContainer}>
          {actionLabel && onAction && (
            <Button
              title={actionLabel}
              onPress={onAction}
              buttonStyle={[
                styles.actionButton,
                { backgroundColor: theme.colors.primary },
              ]}
              titleStyle={styles.actionButtonText}
            />
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              title={secondaryActionLabel}
              onPress={onSecondaryAction}
              type="outline"
              buttonStyle={[
                styles.secondaryActionButton,
                { borderColor: theme.colors.primary },
              ]}
              titleStyle={[
                styles.secondaryActionButtonText,
                { color: theme.colors.primary },
              ]}
            />
          )}
        </View>
      )}
    </View>
  );
};

// Preset empty states for common scenarios
export const EventEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState
    icon="calendar"
    iconType="feather"
    title="暫無活動"
    description="目前沒有可顯示的活動，請稍後再來查看"
    {...props}
  />
);

export const TicketEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState
    icon="ticket"
    iconType="material-community"
    title="暫無票券"
    description="您還沒有購買任何票券"
    actionLabel="瀏覽活動"
    {...props}
  />
);

export const SearchEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState
    icon="search"
    iconType="feather"
    title="找不到相關結果"
    description="請嘗試使用其他關鍵字搜尋"
    actionLabel="清除搜尋"
    {...props}
  />
);

export const FavoriteEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState
    icon="heart"
    iconType="feather"
    title="暫無收藏"
    description="您還沒有收藏任何活動"
    actionLabel="探索活動"
    {...props}
  />
);

export const NotificationEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState
    icon="bell-off"
    iconType="feather"
    title="暫無通知"
    description="當有新的通知時會顯示在這裡"
    {...props}
  />
);

export const HistoryEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState
    icon="clock"
    iconType="feather"
    title="暫無歷史記錄"
    description="您的活動參與記錄會顯示在這裡"
    {...props}
  />
);

export const CartEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState
    icon="shopping-cart"
    iconType="feather"
    title="購物車是空的"
    description="將想要購買的票券加入購物車"
    actionLabel="開始購物"
    {...props}
  />
);

export const NetworkErrorEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState
    icon="wifi-off"
    iconType="feather"
    title="無法載入資料"
    description="請檢查網路連線後重試"
    actionLabel="重試"
    {...props}
  />
);

export const LocationEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState
    icon="map-pin"
    iconType="feather"
    title="附近沒有活動"
    description="擴大搜尋範圍或瀏覽所有活動"
    actionLabel="瀏覽所有活動"
    {...props}
  />
);

export const ComingSoonEmptyState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState
    icon="zap"
    iconType="feather"
    title="即將推出"
    description="此功能正在開發中，敬請期待"
    {...props}
  />
);

const styles = StyleSheet.create({
  // Default variant styles
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  illustrationContainer: {
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionContainer: {
    marginTop: 16,
    width: '100%',
    maxWidth: 280,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 2,
  },
  secondaryActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Compact variant styles
  compactContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 200,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  compactDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  
  // Large variant styles
  largeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    minHeight: 400,
  },
  largeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  largeDescription: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
});

export default EmptyState;