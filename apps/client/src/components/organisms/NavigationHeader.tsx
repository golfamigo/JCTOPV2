import React from 'react';
import { Platform } from 'react-native';
import { Header, Icon } from '@rneui/themed';
import { router } from 'expo-router';
import { useAppTheme } from '@/theme';

export interface NavigationHeaderProps {
  title: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  onMenuPress?: () => void;
  rightComponent?: React.ReactElement;
}

export default function NavigationHeader({
  title,
  showBackButton = false,
  showMenuButton = false,
  onMenuPress,
  rightComponent,
}: NavigationHeaderProps) {
  const { colors, spacing } = useAppTheme();

  const handleBackPress = () => {
    router.back();
  };

  const leftComponent = () => {
    if (showBackButton) {
      return (
        <Icon
          name="arrow-left"
          type="material-community"
          color={colors.white}
          size={28}
          onPress={handleBackPress}
          testID="back-button"
        />
      );
    }
    if (showMenuButton && onMenuPress) {
      return (
        <Icon
          name="menu"
          type="material-community"
          color={colors.white}
          size={28}
          onPress={onMenuPress}
          testID="menu-button"
        />
      );
    }
    return null;
  };

  return (
    <Header
      leftComponent={leftComponent() || undefined}
      centerComponent={{
        text: title,
        style: { color: colors.white, fontSize: 18, fontWeight: '600' },
      }}
      rightComponent={rightComponent}
      backgroundColor={colors.primary}
      containerStyle={{
        paddingTop: Platform.OS === 'ios' ? 0 : spacing.sm,
        borderBottomWidth: 0,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      }}
    />
  );
}