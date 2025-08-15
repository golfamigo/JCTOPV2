import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { 
  Text, 
  SearchBar, 
  ListItem, 
  Badge,
  Button,
  Icon,
  Skeleton,
} from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { adminService } from '@/services/adminService';
import UserManagementTable from '@/components/features/admin/UserManagementTable';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'suspended' | 'deleted';
  createdAt: Date;
  role?: 'user' | 'organizer' | 'admin';
}

export default function UsersManagement() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadUsers = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }

      const response = await adminService.getAllUsers({
        page: isRefresh ? 1 : page,
        limit: 20,
      });

      if (isRefresh) {
        setUsers(response.users);
        setFilteredUsers(response.users);
      } else {
        const newUsers = [...users, ...response.users];
        setUsers(newUsers);
        setFilteredUsers(newUsers);
      }

      setHasMore(response.hasMore);
      if (!isRefresh) setPage(page + 1);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, users]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    try {
      await adminService.updateUserStatus(userId, action);
      // Refresh users list
      loadUsers(true);
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  const renderSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5].map((item) => (
        <ListItem key={item} bottomDivider>
          <Skeleton animation="pulse" width={40} height={40} circle />
          <ListItem.Content>
            <Skeleton animation="pulse" width={200} height={16} />
            <Skeleton animation="pulse" width={150} height={14} style={{ marginTop: 4 }} />
          </ListItem.Content>
          <Skeleton animation="pulse" width={60} height={24} />
        </ListItem>
      ))}
    </>
  );

  if (loading && users.length === 0) {
    return (
      <View style={styles.container}>
        <SearchBar
          placeholder={t('admin.userManagement.searchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          lightTheme
          containerStyle={styles.searchContainer}
          inputContainerStyle={styles.searchInput}
        />
        {renderSkeleton()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder={t('admin.userManagement.searchPlaceholder')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        lightTheme
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInput}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadUsers(true)} />
        }
        renderItem={({ item: user }) => (
          <UserManagementTable
            user={user}
            onAction={handleUserAction}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon
              name="account-off"
              type="material-community"
              size={64}
              color={colors.grey}
            />
            <Text style={[styles.emptyText, { color: colors.grey }]}>
              {searchQuery ? t('common.noResults') : t('admin.userManagement.noUsers')}
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore && !refreshing ? (
            <View style={styles.loadMoreContainer}>
              {loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Button
                  title={t('common.loadMore')}
                  onPress={() => loadUsers()}
                  type="outline"
                  size="sm"
                />
              )}
            </View>
          ) : null
        }
        onEndReached={() => {
          if (hasMore && !loading && !refreshing) {
            loadUsers();
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 0,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  loadMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});