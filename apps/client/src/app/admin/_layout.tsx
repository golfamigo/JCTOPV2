import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable, Platform } from 'react-native';
import { Stack, router, usePathname } from 'expo-router';
import { ListItem, Text, Icon, Divider } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import NavigationHeader from '@/components/organisms/NavigationHeader';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface DrawerSection {
  title: string;
  items: DrawerItem[];
}

interface DrawerItem {
  title: string;
  icon: string;
  route: string;
  badge?: number;
}

export default function AdminLayout() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { isAdmin, isLoading, checkAdminAccess } = useAdminAuth();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const drawerSections: DrawerSection[] = [
    {
      title: t('admin.sections.overview'),
      items: [
        {
          title: t('admin.dashboard'),
          icon: 'view-dashboard',
          route: '/admin/dashboard',
        },
        {
          title: t('admin.systemHealth'),
          icon: 'heart-pulse',
          route: '/admin/system-health',
        },
      ],
    },
    {
      title: t('admin.sections.management'),
      items: [
        {
          title: t('admin.users'),
          icon: 'account-group',
          route: '/admin/users',
        },
        {
          title: t('admin.events'),
          icon: 'calendar-multiple',
          route: '/admin/events',
        },
      ],
    },
    {
      title: t('admin.sections.analytics'),
      items: [
        {
          title: t('admin.reports'),
          icon: 'chart-bar',
          route: '/admin/reports',
        },
        {
          title: t('admin.audit'),
          icon: 'history',
          route: '/admin/audit',
        },
      ],
    },
  ];

  const navigateToRoute = (route: string) => {
    setDrawerOpen(false);
    router.push(route as any);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const getPageTitle = () => {
    const currentPath = pathname.split('/').pop();
    switch (currentPath) {
      case 'dashboard':
        return t('admin.dashboard');
      case 'users':
        return t('admin.users');
      case 'events':
        return t('admin.events');
      case 'system-health':
        return t('admin.systemHealth');
      case 'reports':
        return t('admin.reports');
      case 'audit':
        return t('admin.audit');
      default:
        return t('admin.title');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon
          name="shield-lock"
          type="material-community"
          size={64}
          color={colors.danger}
        />
        <Text h4 style={[styles.errorText, { color: colors.danger }]}>
          {t('admin.accessDenied')}
        </Text>
        <Text style={{ color: colors.grey }}>
          {t('admin.adminOnly')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavigationHeader
        title={getPageTitle()}
        showMenuButton
        onMenuPress={toggleDrawer}
      />

      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="users" />
          <Stack.Screen name="events" />
          <Stack.Screen name="system-health" />
          <Stack.Screen name="reports" />
          <Stack.Screen name="audit" />
        </Stack>
      </View>

      {drawerOpen && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFillObject, styles.overlay]}
            onPress={() => setDrawerOpen(false)}
          />
          <View style={[styles.drawer, { backgroundColor: colors.white }]}>
            <SafeAreaView style={styles.drawerContent}>
              <View style={[styles.drawerHeader, { backgroundColor: colors.primary }]}>
                <Icon
                  name="shield-crown"
                  type="material-community"
                  size={32}
                  color={colors.white}
                />
                <Text h4 style={{ color: colors.white, marginLeft: spacing.md }}>
                  {t('admin.title')}
                </Text>
              </View>

              <ScrollView style={styles.drawerScroll}>
                {drawerSections.map((section, sectionIndex) => (
                  <View key={sectionIndex}>
                    <Text style={[styles.sectionTitle, { color: colors.grey }]}>
                      {section.title}
                    </Text>
                    {section.items.map((item, itemIndex) => {
                      const isActive = pathname === item.route;
                      return (
                        <ListItem
                          key={itemIndex}
                          onPress={() => navigateToRoute(item.route)}
                          containerStyle={[
                            styles.drawerItem,
                            isActive && { backgroundColor: colors.lightGrey },
                          ]}
                          bottomDivider={itemIndex < section.items.length - 1}
                        >
                          <Icon
                            name={item.icon}
                            type="material-community"
                            size={24}
                            color={isActive ? colors.primary : colors.grey}
                          />
                          <ListItem.Content>
                            <ListItem.Title
                              style={{
                                color: isActive ? colors.primary : colors.black,
                                fontWeight: isActive ? 'bold' : 'normal',
                              }}
                            >
                              {item.title}
                            </ListItem.Title>
                          </ListItem.Content>
                          {item.badge && item.badge > 0 && (
                            <View
                              style={[
                                styles.badge,
                                { backgroundColor: colors.danger },
                              ]}
                            >
                              <Text style={{ color: colors.white, fontSize: 12 }}>
                                {item.badge}
                              </Text>
                            </View>
                          )}
                          <ListItem.Chevron />
                        </ListItem>
                      );
                    })}
                    {sectionIndex < drawerSections.length - 1 && (
                      <Divider style={{ marginVertical: spacing.sm }} />
                    )}
                  </View>
                ))}
              </ScrollView>

              <View style={[styles.drawerFooter, { borderTopColor: colors.lightGrey }]}>
                <Pressable
                  onPress={() => {
                    setDrawerOpen(false);
                    router.push('/(tabs)/profile');
                  }}
                  style={styles.footerButton}
                >
                  <Icon
                    name="exit-to-app"
                    type="material-community"
                    size={24}
                    color={colors.grey}
                  />
                  <Text style={{ color: colors.grey, marginLeft: spacing.sm }}>
                    {t('admin.exitAdmin')}
                  </Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: Platform.select({
      ios: 300,
      android: 280,
      default: 320,
    }),
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      default: {},
    }),
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  drawerScroll: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  drawerItem: {
    paddingVertical: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  drawerFooter: {
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 8,
  },
});