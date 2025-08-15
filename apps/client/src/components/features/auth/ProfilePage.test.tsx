import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfilePage from './ProfilePage';

// Mock the auth store
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  authProvider: 'google',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-06-01T00:00:00.000Z',
};

const mockGetProfile = jest.fn();
const mockUpdateProfile = jest.fn();

jest.mock('../../../stores/authStore', () => ({
  useAuthStore: () => ({
    user: mockUser,
    getProfile: mockGetProfile,
    updateProfile: mockUpdateProfile,
  }),
}));

// Mock localization
jest.mock('../../../localization', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        'common.loading': '載入中...',
        'common.error': '錯誤',
        'common.success': '成功',
        'common.edit': '編輯',
        'common.save': '儲存',
        'common.cancel': '取消',
        'profile.profile': '個人資料',
        'profile.profileUpdated': '個人資料已更新',
        'profile.accountInformation': '帳戶資訊',
        'profile.authProvider': '驗證提供者',
        'profile.memberSince': '註冊日期',
        'profile.lastUpdated': '最後更新',
        'profile.cannotBeChanged': '無法變更',
        'profile.notProvided': '未提供',
        'auth.name': '姓名',
        'auth.email': '電子信箱',
        'auth.phone': '電話號碼',
        'auth.enterName': '請輸入您的姓名',
        'validation.minLength': '至少需要 {{count}} 個字元',
        'validation.maxLength': '最多 {{count}} 個字元',
        'validation.invalidPhoneNumber': '請輸入有效的電話號碼',
        'messages.somethingWentWrong': '發生錯誤，請稍後再試',
      };
      
      if (options?.count !== undefined) {
        return translations[key]?.replace('{{count}}', options.count.toString()) || key;
      }
      return translations[key] || key;
    },
  }),
}));

// Mock theme
jest.mock('../../../theme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#007BFF',
      background: '#FFFFFF',
      lightGrey: '#F8F9FA',
      midGrey: '#6C757D',
      dark: '#212529',
      success: '#28A745',
      danger: '#DC3545',
      text: '#212529',
      textSecondary: '#6C757D',
      border: '#E9ECEF',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    typography: {
      h1: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212529',
      },
      h2: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212529',
      },
      body: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#212529',
      },
    },
  }),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without errors with user data', () => {
      const { getByText } = render(<ProfilePage />);
      
      // Should render without throwing errors
      expect(getByText('個人資料')).toBeTruthy();
    });

    it('displays user information correctly', () => {
      const { getByDisplayValue, getByText } = render(<ProfilePage />);
      
      // Check if user data is displayed
      expect(getByDisplayValue('John Doe')).toBeTruthy();
      expect(getByText('john.doe@example.com')).toBeTruthy(); // Email is displayed as text, not input
      expect(getByDisplayValue('+1234567890')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('validates name field with minimum length', async () => {
      const { getByText, getByDisplayValue } = render(<ProfilePage />);
      
      // Enter edit mode
      fireEvent.press(getByText('編輯'));
      
      // Find name input and set short value
      const nameInput = getByDisplayValue('John Doe');
      fireEvent.changeText(nameInput, 'a');
      
      // Try to save
      fireEvent.press(getByText('儲存'));
      
      // Should show validation error
      await waitFor(() => {
        expect(getByText('至少需要 2 個字元')).toBeTruthy();
      });
    });

    it('validates empty name field does not show error', async () => {
      const { getByText, getByDisplayValue, queryByText } = render(<ProfilePage />);
      
      // Enter edit mode
      fireEvent.press(getByText('編輯'));
      
      // Find name input and set empty value
      const nameInput = getByDisplayValue('John Doe');
      fireEvent.changeText(nameInput, '');
      
      // Try to save
      fireEvent.press(getByText('儲存'));
      
      // Should not show validation error for empty name
      await waitFor(() => {
        expect(queryByText('至少需要 2 個字元')).toBeFalsy();
      });
    });

    it('validates phone field format', async () => {
      const { getByText, getByDisplayValue } = render(<ProfilePage />);
      
      // Enter edit mode
      fireEvent.press(getByText('編輯'));
      
      // Find phone input and set invalid value
      const phoneInput = getByDisplayValue('+1234567890');
      fireEvent.changeText(phoneInput, 'invalid');
      
      // Try to save
      fireEvent.press(getByText('儲存'));
      
      // Should show validation error
      await waitFor(() => {
        expect(getByText('請輸入有效的電話號碼')).toBeTruthy();
      });
    });
  });

  describe('Profile Updates', () => {
    it('successfully updates profile', async () => {
      mockUpdateProfile.mockResolvedValue({});
      
      const { getByText, getByDisplayValue } = render(<ProfilePage />);
      
      // Enter edit mode
      fireEvent.press(getByText('編輯'));
      
      // Update name
      const nameInput = getByDisplayValue('John Doe');
      fireEvent.changeText(nameInput, 'Jane Doe');
      
      // Save changes
      fireEvent.press(getByText('儲存'));
      
      // Should call updateProfile
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({ name: 'Jane Doe' });
      });
    });

    it('handles update errors', async () => {
      mockUpdateProfile.mockRejectedValue(new Error('Update failed'));
      
      const { getByText, getByDisplayValue } = render(<ProfilePage />);
      
      // Enter edit mode
      fireEvent.press(getByText('編輯'));
      
      // Update name
      const nameInput = getByDisplayValue('John Doe');
      fireEvent.changeText(nameInput, 'Jane Doe');
      
      // Save changes
      fireEvent.press(getByText('儲存'));
      
      // Should show error
      await waitFor(() => {
        expect(getByText('Update failed')).toBeTruthy();
      });
    });
  });

  describe('Edit Mode Toggle', () => {
    it('toggles between view and edit modes', () => {
      const { getByText, queryByText } = render(<ProfilePage />);
      
      // Should be in view mode initially
      expect(getByText('編輯')).toBeTruthy();
      expect(queryByText('儲存')).toBeFalsy();
      
      // Enter edit mode
      fireEvent.press(getByText('編輯'));
      
      // Should be in edit mode
      expect(getByText('儲存')).toBeTruthy();
      expect(getByText('取消')).toBeTruthy();
      
      // Cancel edit mode
      fireEvent.press(getByText('取消'));
      
      // Should be back in view mode
      expect(getByText('編輯')).toBeTruthy();
      expect(queryByText('儲存')).toBeFalsy();
    });
  });

  describe('Internationalization', () => {
    it('displays Traditional Chinese text', () => {
      const { getByText } = render(<ProfilePage />);
      
      // Check for Chinese text
      expect(getByText('個人資料')).toBeTruthy();
      expect(getByText('姓名')).toBeTruthy();
      expect(getByText('電子信箱')).toBeTruthy();
      expect(getByText('電話號碼')).toBeTruthy();
      expect(getByText('帳戶資訊')).toBeTruthy();
    });
  });
});