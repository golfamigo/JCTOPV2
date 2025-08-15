import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Stack, router } from 'expo-router';
import { ListItem, Text } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import NavigationHeader from '@/components/organisms/NavigationHeader';

interface DrawerItem {
  title: string;
  icon: string;
  route: string;
}

export default function OrganizerLayout() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('/organizer/dashboard');

  const drawerItems: DrawerItem[] = [
    {
      title: t('organizer.dashboard'),
      icon: 'view-dashboard',
      route: '/organizer/dashboard',
    },
    {
      title: t('organizer.myEvents'),
      icon: 'calendar',
      route: '/organizer/events',
    },
    {
      title: t('organizer.attendees'),
      icon: 'account-group',
      route: '/organizer/attendees',
    },
    {
      title: t('organizer.discounts'),
      icon: 'tag-multiple',
      route: '/organizer/discounts',
    },
    {
      title: t('organizer.reports'),
      icon: 'chart-bar',
      route: '/organizer/reports',
    },
    {
      title: t('navigation.settings'),
      icon: 'cog',
      route: '/organizer/settings',
    },
  ];

  const navigateToRoute = (route: string) => {
    setActiveRoute(route);
    setDrawerOpen(false);
    router.push(route as any);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <View style={styles.container}>
      <NavigationHeader
        title={t('organizer.dashboard')}
        showMenuButton
        onMenuPress={toggleDrawer}
      />

      {/* Main Content */}
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="events" />
          <Stack.Screen name="attendees" />
          <Stack.Screen name="discounts" />
          <Stack.Screen name="reports" />
          <Stack.Screen name="settings" />
        </Stack>
      </View>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <View style={[StyleSheet.absoluteFillObject, styles.overlay]}>
          <View style={[styles.drawer, { backgroundColor: colors.white }]}>
            <SafeAreaView style={styles.drawerContent}>
              {/* Drawer Header */}
              <View style={[styles.drawerHeader, { backgroundColor: colors.primary }]}>
                <Text h4 style={{ color: colors.white }}>
                  {t('organizer.dashboard')}
                </Text>
              </View>

              {/* Drawer Items */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {drawerItems.map((item, index) => (
                  <ListItem
                    key={index}
                    onPress={() => navigateToRoute(item.route)}
                    containerStyle={[
                      styles.drawerItem,
                      activeRoute === item.route && { backgroundColor: colors.lightGrey },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={24}
                      color={activeRoute === item.route ? colors.primary : colors.midGrey}
                    />
                    <ListItem.Content>
                      <ListItem.Title
                        style={[
                          styles.drawerItemText,
                          {
                            color: activeRoute === item.route ? colors.primary : colors.dark,
                            fontWeight: activeRoute === item.route ? '600' : '400',
                          },
                        ]}
                      >
                        {item.title}
                      </ListItem.Title>
                    </ListItem.Content>
                    {activeRoute === item.route && (
                      <View
                        style={[
                          styles.activeIndicator,
                          { backgroundColor: colors.primary },
                        ]}
                      />
                    )}
                  </ListItem>
                ))}
              </ScrollView>
            </SafeAreaView>
          </View>

          {/* Overlay to close drawer */}
          <View 
            style={styles.overlayTouchable} 
            onStartShouldSetResponder={() => true}
            onResponderGrant={toggleDrawer}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  overlay: {
    flexDirection: 'row',
    zIndex: 1000,
  },
  drawer: {
    width: 280,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    paddingHorizontal: 16, // 2x spacing (8pt grid)
    paddingVertical: 24, // 3x spacing (8pt grid)
    marginBottom: 8, // 1x spacing
  },
  drawerItem: {
    paddingVertical: 16, // 2x spacing
    paddingHorizontal: 16, // 2x spacing
    position: 'relative',
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 16, // 2x spacing
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  overlayTouchable: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});