import React from 'react';
import { ListItem, ListItemProps, Avatar, Text } from '@rneui/themed';
import { FlatList, FlatListProps, View, ActivityIndicator } from 'react-native';
import { useAppTheme } from '@/theme';
import { getTouchTargetSize } from '../../utils/responsive';
import { MaterialIcons } from '@expo/vector-icons';

export interface SharedListItemData {
  id: string;
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  avatarUri?: string;
  avatarTitle?: string;
  badge?: string | number;
  onPress?: () => void;
}

interface SharedListProps<T extends SharedListItemData> extends Omit<FlatListProps<T>, 'renderItem'> {
  items: T[];
  loading?: boolean;
  emptyMessage?: string;
  onItemPress?: (item: T) => void;
  showDivider?: boolean;
  variant?: 'default' | 'compact' | 'expanded';
  renderCustomContent?: (item: T) => React.ReactNode;
}

export function SharedList<T extends SharedListItemData>({
  items,
  loading = false,
  emptyMessage = 'No items to display',
  onItemPress,
  showDivider = true,
  variant = 'default',
  renderCustomContent,
  ...flatListProps
}: SharedListProps<T>) {
  const { colors, typography } = useAppTheme();

  const getPaddingForVariant = () => {
    const minTouchTarget = getTouchTargetSize();
    
    switch (variant) {
      case 'compact':
        return { 
          paddingVertical: 8, 
          paddingHorizontal: 16,
          minHeight: minTouchTarget 
        };
      case 'expanded':
        return { 
          paddingVertical: 20, 
          paddingHorizontal: 20,
          minHeight: Math.max(80, minTouchTarget)
        };
      default:
        return { 
          paddingVertical: 12, 
          paddingHorizontal: 16,
          minHeight: Math.max(60, minTouchTarget)
        };
    }
  };

  const renderItem = ({ item }: { item: T }) => {
    const handlePress = () => {
      if (item.onPress) {
        item.onPress();
      } else if (onItemPress) {
        onItemPress(item);
      }
    };

    const padding = getPaddingForVariant();

    return (
      <ListItem
        onPress={handlePress}
        bottomDivider={showDivider}
        containerStyle={[
          padding,
          { backgroundColor: colors.white }
        ]}
      >
        {(item.avatarUri || item.avatarTitle || item.leftIcon) && (
          <>
            {item.avatarUri ? (
              <Avatar 
                source={{ uri: item.avatarUri }} 
                rounded 
                size={variant === 'compact' ? 'small' : 'medium'}
              />
            ) : item.avatarTitle ? (
              <Avatar
                title={item.avatarTitle}
                rounded
                size={variant === 'compact' ? 'small' : 'medium'}
                containerStyle={{ backgroundColor: colors.primary }}
              />
            ) : item.leftIcon ? (
              <MaterialIcons 
                name={item.leftIcon as any} 
                size={24} 
                color={colors.primary} 
              />
            ) : null}
          </>
        )}
        
        <ListItem.Content>
          {renderCustomContent ? (
            renderCustomContent(item)
          ) : (
            <>
              <ListItem.Title style={[
                typography.body,
                { fontWeight: '600', color: colors.text }
              ]}>
                {item.title}
              </ListItem.Title>
              {item.subtitle && (
                <ListItem.Subtitle style={[
                  typography.caption,
                  { color: colors.textSecondary, marginTop: 2 }
                ]}>
                  {item.subtitle}
                </ListItem.Subtitle>
              )}
            </>
          )}
        </ListItem.Content>

        {item.badge && (
          <View
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              marginRight: 8
            }}
          >
            <Text style={{ color: colors.white, fontSize: 12, fontWeight: '600' }}>
              {item.badge}
            </Text>
          </View>
        )}

        {item.rightIcon && (
          <MaterialIcons 
            name={item.rightIcon as any} 
            size={20} 
            color={colors.midGrey} 
          />
        )}
      </ListItem>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <MaterialIcons name="inbox" size={48} color={colors.midGrey} />
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 16, textAlign: 'center' }]}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      {...flatListProps}
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={{ backgroundColor: colors.background }}
    />
  );
}