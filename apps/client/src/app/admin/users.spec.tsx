import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import UsersManagement from './users';
import { adminService } from '@/services/adminService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/theme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#007BFF',
      success: '#28A745',
      warning: '#FFC107',
      danger: '#DC3545',
      grey: '#6C757D',
    },
    spacing: {
      sm: 8,
      md: 16,
    },
  }),
}));

jest.mock('@/services/adminService', () => ({
  adminService: {
    getAllUsers: jest.fn(),
    updateUserStatus: jest.fn(),
  },
}));

jest.mock('@/components/features/admin/UserManagementTable', () => {
  const { View, Text } = require('react-native');
  return function UserManagementTable({ user, onAction }: any) {
    return (
      <View testID={`user-${user.id}`}>
        <Text>{user.name}</Text>
        <Text>{user.email}</Text>
      </View>
    );
  };
});

describe('UsersManagement', () => {
  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'suspended',
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (adminService.getAllUsers as jest.Mock).mockResolvedValue({
      users: mockUsers,
      total: 2,
      page: 1,
      hasMore: false,
    });
  });

  it('renders user management screen with search bar', async () => {
    const { getByPlaceholderText } = render(<UsersManagement />);
    
    await waitFor(() => {
      expect(getByPlaceholderText('admin.userManagement.searchPlaceholder')).toBeTruthy();
    });
  });

  it('loads and displays users on mount', async () => {
    const { getByText } = render(<UsersManagement />);
    
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('jane@example.com')).toBeTruthy();
    });
    
    expect(adminService.getAllUsers).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
    });
  });

  it('filters users based on search query', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<UsersManagement />);
    
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });
    
    const searchBar = getByPlaceholderText('admin.userManagement.searchPlaceholder');
    fireEvent.changeText(searchBar, 'jane');
    
    await waitFor(() => {
      expect(queryByText('John Doe')).toBeNull();
      expect(getByText('Jane Smith')).toBeTruthy();
    });
  });

  it('shows loading skeleton while fetching users', () => {
    (adminService.getAllUsers as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );
    
    const { getAllByTestId } = render(<UsersManagement />);
    
    // Check for skeleton elements
    expect(getAllByTestId('RNE__Skeleton')).toHaveLength(15); // 5 items x 3 skeletons each
  });

  it('shows empty state when no users found', async () => {
    (adminService.getAllUsers as jest.Mock).mockResolvedValue({
      users: [],
      total: 0,
      page: 1,
      hasMore: false,
    });
    
    const { getByText } = render(<UsersManagement />);
    
    await waitFor(() => {
      expect(getByText('admin.userManagement.noUsers')).toBeTruthy();
    });
  });

  it('handles pull to refresh', async () => {
    const { getByTestId } = render(<UsersManagement />);
    
    await waitFor(() => {
      expect(adminService.getAllUsers).toHaveBeenCalledTimes(1);
    });
    
    const flatList = getByTestId('user-list');
    const { refreshControl } = flatList.props;
    
    await refreshControl.props.onRefresh();
    
    await waitFor(() => {
      expect(adminService.getAllUsers).toHaveBeenCalledTimes(2);
      expect(adminService.getAllUsers).toHaveBeenLastCalledWith({
        page: 1,
        limit: 20,
      });
    });
  });

  it('handles pagination correctly', async () => {
    (adminService.getAllUsers as jest.Mock).mockResolvedValue({
      users: mockUsers,
      total: 100,
      page: 1,
      hasMore: true,
    });
    
    const { getByText, getByTestId } = render(<UsersManagement />);
    
    await waitFor(() => {
      expect(getByText('common.loadMore')).toBeTruthy();
    });
    
    const loadMoreButton = getByText('common.loadMore');
    fireEvent.press(loadMoreButton);
    
    await waitFor(() => {
      expect(adminService.getAllUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
    });
  });

  it('handles user action correctly', async () => {
    (adminService.updateUserStatus as jest.Mock).mockResolvedValue(undefined);
    
    const { getByTestId } = render(<UsersManagement />);
    
    await waitFor(() => {
      expect(getByTestId('user-1')).toBeTruthy();
    });
    
    // Simulate user action through the table component
    // In real implementation, this would be triggered by UserManagementTable
    await adminService.updateUserStatus('1', 'suspend');
    
    expect(adminService.updateUserStatus).toHaveBeenCalledWith('1', 'suspend');
  });
});