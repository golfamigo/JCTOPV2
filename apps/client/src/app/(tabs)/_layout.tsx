import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { Platform } from 'react-native';

interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const responsive = useResponsive();

  // Adjust tab bar height based on orientation and device
  const getTabBarHeight = () => {
    if (responsive.isLandscape && responsive.isPhone) {
      return Platform.OS === 'ios' ? 56 : 48; // Smaller height in landscape on phones
    }
    if (responsive.isTablet) {
      return Platform.OS === 'ios' ? 64 : 56; // Tablet optimized height
    }
    return Platform.OS === 'ios' ? 88 : 64; // Default height
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.midGrey,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: responsive.isLandscape && responsive.isPhone 
            ? spacing.xs 
            : Platform.OS === 'ios' ? spacing.lg : spacing.md,
          paddingTop: responsive.isLandscape && responsive.isPhone ? 0 : spacing.sm,
          height: getTabBarHeight(),
        },
        tabBarLabelStyle: {
          fontSize: responsive.isLandscape && responsive.isPhone ? 10 : 12,
          fontWeight: '500',
          marginTop: responsive.isLandscape && responsive.isPhone ? 0 : spacing.xs,
        },
        tabBarItemStyle: {
          paddingVertical: responsive.isLandscape && responsive.isPhone ? 0 : spacing.xs,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="events"
        options={{
          title: t('navigation.discover'),
          tabBarLabel: t('navigation.discover'),
          tabBarIcon: ({ focused, color, size }: TabBarIconProps) => (
            <MaterialCommunityIcons 
              name={focused ? 'compass' : 'compass-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: t('profile.myTickets'),
          tabBarLabel: t('profile.myTickets'),
          tabBarIcon: ({ focused, color, size }: TabBarIconProps) => (
            <MaterialCommunityIcons 
              name={focused ? 'ticket' : 'ticket-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.profile'),
          tabBarLabel: t('profile.profile'),
          tabBarIcon: ({ focused, color, size }: TabBarIconProps) => (
            <MaterialCommunityIcons 
              name={focused ? 'account' : 'account-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}