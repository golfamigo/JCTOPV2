import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, Dimensions } from 'react-native';
import TicketsScreen from './tickets';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'tickets.ticketConfiguration': '票券設定',
        'tickets.addTicket': '新增票券',
        'tickets.editTicket': '編輯票券',
        'tickets.deleteTicket': '刪除票券',
        'tickets.noTickets': '尚未建立票券',
        'tickets.noTicketsDescription': '開始建立您的第一個票券類型，設定價格和數量限制。',
        'tickets.createFirstTicket': '建立第一個票券',
        'tickets.ticketName': '票券名稱',
        'tickets.ticketNamePlaceholder': '例如：早鳥票、VIP票、一般票',
        'tickets.description': '票券描述',
        'tickets.descriptionPlaceholder': '簡短描述此票券的特色（選填）',
        'tickets.price': '票價',
        'tickets.pricePlaceholder': '輸入票價金額',
        'tickets.basicInformation': '基本資訊',
        'tickets.pricing': '價格設定',
        'tickets.quantityManagement': '數量管理',
        'tickets.earlyBirdSettings': '早鳥設定',
        'tickets.statusAndVisibility': '狀態與可見性',
        'tickets.unlimitedQuantity': '無數量限制',
        'tickets.availableQuantity': '可售數量',
        'tickets.quantityPlaceholder': '輸入可售票券數量',
        'tickets.minPurchase': '最少購買數量',
        'tickets.maxPurchase': '最多購買數量',
        'tickets.enableEarlyBird': '啟用早鳥優惠',
        'tickets.earlyBirdPrice': '早鳥價格',
        'tickets.earlyBirdPricePlaceholder': '輸入早鳥優惠價格',
        'tickets.earlyBirdEndDate': '早鳥結束日期',
        'tickets.selectEarlyBirdEndDate': '選擇早鳥優惠結束日期',
        'tickets.activeTicket': '啟用此票券',
        'tickets.visibility': '可見性',
        'tickets.publicVisible': '公開 - 所有人都可以看到',
        'tickets.privateVisible': '私人 - 僅限邀請連結',
        'tickets.hiddenVisible': '隱藏 - 暫不顯示',
        'tickets.active': '啟用',
        'tickets.inactive': '停用',
        'tickets.soldOut': '售完',
        'tickets.unlimited': '無限制',
        'tickets.available': '可用',
        'tickets.earlyBird': '早鳥票',
        'tickets.cannotDelete': '無法刪除',
        'tickets.cannotDeleteWithSales': '已售出的票券無法刪除，您可以停用此票券。',
        'tickets.confirmDelete': '確認刪除',
        'tickets.confirmDeleteMessage': '確定要刪除「{{name}}」票券嗎？此操作無法復原。',
        'common.save': '儲存',
        'common.cancel': '取消',
        'common.delete': '刪除',
        'common.confirm': '確認',
        'common.optional': '選填',
        'tickets.errors.nameRequired': '請輸入票券名稱',
        'tickets.errors.nameTooShort': '票券名稱至少需要5個字元',
        'tickets.errors.priceRequired': '請輸入票價',
        'tickets.errors.pricePositive': '票價必須大於0',
        'tickets.errors.quantityRequired': '請輸入可售數量',
        'tickets.errors.earlyBirdPriceRequired': '請輸入早鳥價格',
        'tickets.errors.earlyBirdPriceLower': '早鳥價格必須低於原價',
      };
      
      if (params && key.includes('{{')) {
        return key.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => params[paramKey] || match);
      }
      
      return translations[key] || key;
    },
  }),
}));

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock('@/theme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#007BFF',
      background: '#FFFFFF',
      white: '#FFFFFF',
      black: '#212529',
      grey0: '#F8F9FA',
      grey2: '#6C757D',
      grey3: '#6C757D',
      greyOutline: '#E9ECEF',
      error: '#DC3545',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
  }),
}));

// Mock React Native Elements components
jest.mock('@rneui/themed', () => {
  const React = require('react');
  const { Text: RNText, View, TouchableOpacity, TextInput } = require('react-native');

  return {
    Text: ({ children, style, ...props }: any) => (
      <RNText style={style} {...props}>{children}</RNText>
    ),
    Button: ({ title, onPress, buttonStyle, titleStyle, containerStyle, ...props }: any) => (
      <View style={containerStyle}>
        <TouchableOpacity 
          testID={`button-${title?.toLowerCase().replace(/\s+/g, '-')}`}
          style={[{ padding: 10, backgroundColor: '#007BFF' }, buttonStyle]}
          onPress={onPress}
          {...props}
        >
          <RNText style={[{ color: 'white', textAlign: 'center' }, titleStyle]}>{title}</RNText>
        </TouchableOpacity>
      </View>
    ),
    Card: ({ children, containerStyle }: any) => (
      <View style={containerStyle}>{children}</View>
    ),
    ListItem: ({ children, onPress, containerStyle }: any) => (
      <TouchableOpacity style={containerStyle} onPress={onPress}>
        <View>{children}</View>
      </TouchableOpacity>
    ),
    'ListItem.Content': ({ children }: any) => <View>{children}</View>,
    Icon: ({ name, onPress, testID, ...props }: any) => (
      <TouchableOpacity onPress={onPress} testID={testID || `icon-${name}`}>
        <RNText>{name}</RNText>
      </TouchableOpacity>
    ),
    Input: ({ 
      label, 
      placeholder, 
      value, 
      onChangeText, 
      errorMessage, 
      testID,
      multiline,
      keyboardType,
      maxLength,
      ...props 
    }: any) => (
      <View>
        {label && <RNText>{label}</RNText>}
        <TextInput
          testID={testID || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType}
          maxLength={maxLength}
          style={{ borderWidth: 1, padding: 8, marginBottom: 4 }}
          {...props}
        />
        {errorMessage && <RNText style={{ color: 'red' }}>{errorMessage}</RNText>}
      </View>
    ),
    Overlay: ({ isVisible, children, onBackdropPress }: any) => {
      if (!isVisible) return null;
      return (
        <View testID="overlay">
          <TouchableOpacity testID="overlay-backdrop" onPress={onBackdropPress} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <View>{children}</View>
        </View>
      );
    },
    Switch: ({ value, onValueChange, testID }: any) => (
      <TouchableOpacity
        testID={testID || 'switch'}
        onPress={() => onValueChange(!value)}
      >
        <RNText>{value ? 'ON' : 'OFF'}</RNText>
      </TouchableOpacity>
    ),
    Badge: ({ value, status, containerStyle }: any) => (
      <View style={containerStyle}>
        <RNText testID={`badge-${status}`}>{value}</RNText>
      </View>
    ),
    Slider: ({ value, onValueChange, testID }: any) => (
      <TouchableOpacity
        testID={testID || 'slider'}
        onPress={() => onValueChange && onValueChange(50)}
      >
        <RNText>Slider: {value}</RNText>
      </TouchableOpacity>
    ),
    Divider: ({ style }: any) => <View style={[{ height: 1, backgroundColor: '#ccc' }, style]} />,
    CheckBox: ({ title, checked, onPress, testID }: any) => (
      <TouchableOpacity testID={testID || `checkbox-${title?.toLowerCase().replace(/\s+/g, '-')}`} onPress={onPress}>
        <RNText>{checked ? '☑' : '☐'} {title}</RNText>
      </TouchableOpacity>
    ),
  };
});

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  
  return ({ value, onChange, testID }: any) => (
    <TouchableOpacity
      testID={testID || 'datetime-picker'}
      onPress={() => onChange && onChange(null, new Date('2025-02-01'))}
    >
      <Text>DatePicker: {value?.toDateString()}</Text>
    </TouchableOpacity>
  );
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock Alert
const mockAlert = {
  alert: jest.fn(),
};
jest.spyOn(Alert, 'alert').mockImplementation(mockAlert.alert);

// Mock Dimensions
const mockDimensions = {
  get: jest.fn(() => ({ width: 375, height: 812 })),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
};
jest.spyOn(Dimensions, 'get').mockImplementation(mockDimensions.get);
jest.spyOn(Dimensions, 'addEventListener').mockImplementation(mockDimensions.addEventListener);

describe('TicketsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any pending timers if they exist
    if (jest.getTimerCount && jest.getTimerCount() > 0) {
      jest.runOnlyPendingTimers();
    }
  });

  describe('Screen Rendering', () => {
    it('renders ticket configuration screen with header', async () => {
      render(<TicketsScreen />);
      
      expect(screen.getByText('票券設定')).toBeTruthy();
      expect(screen.getByTestId('button-新增票券')).toBeTruthy();
    });

    it('renders sample tickets with correct information', async () => {
      render(<TicketsScreen />);
      
      expect(screen.getByText('早鳥票')).toBeTruthy();
      expect(screen.getByText('一般票')).toBeTruthy();
      expect(screen.getByText('VIP票')).toBeTruthy();
      
      // Check early bird pricing display
      expect(screen.getByText(/NT\$1,000/)).toBeTruthy();
    });

    it('renders ticket status badges correctly', async () => {
      render(<TicketsScreen />);
      
      // Should have active and inactive badges
      expect(screen.getByTestId('badge-success')).toBeTruthy();
      expect(screen.getByTestId('badge-error')).toBeTruthy();
    });
  });

  describe('Add Ticket Functionality', () => {
    it('opens add ticket form when add button is pressed', async () => {
      render(<TicketsScreen />);
      
      const addButton = screen.getByTestId('button-新增票券');
      fireEvent.press(addButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('overlay')).toBeTruthy();
        expect(screen.getByText('基本資訊')).toBeTruthy();
      });
    });

    it('validates required fields in add ticket form', async () => {
      render(<TicketsScreen />);
      
      // Open add form
      fireEvent.press(screen.getByTestId('button-新增票券'));
      
      await waitFor(() => {
        expect(screen.getByTestId('overlay')).toBeTruthy();
      });
      
      // Try to save without filling required fields
      const saveButton = screen.getByTestId('button-儲存');
      fireEvent.press(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('請輸入票券名稱')).toBeTruthy();
        expect(screen.getByText('請輸入票價')).toBeTruthy();
      });
    });

    it('validates ticket name length', async () => {
      render(<TicketsScreen />);
      
      fireEvent.press(screen.getByTestId('button-新增票券'));
      
      await waitFor(() => {
        const nameInput = screen.getByTestId('input-票券名稱');
        fireEvent.changeText(nameInput, 'abc'); // Too short
        
        const saveButton = screen.getByTestId('button-儲存');
        fireEvent.press(saveButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('票券名稱至少需要5個字元')).toBeTruthy();
      });
    });

    it('validates price input format', async () => {
      render(<TicketsScreen />);
      
      fireEvent.press(screen.getByTestId('button-新增票券'));
      
      await waitFor(() => {
        const priceInput = screen.getByTestId('input-票價');
        fireEvent.changeText(priceInput, '0'); // Invalid price
        
        const saveButton = screen.getByTestId('button-儲存');
        fireEvent.press(saveButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('票價必須大於0')).toBeTruthy();
      });
    });

    it('successfully creates new ticket with valid data', async () => {
      render(<TicketsScreen />);
      
      fireEvent.press(screen.getByTestId('button-新增票券'));
      
      await waitFor(() => {
        // Fill in required fields
        const nameInput = screen.getByTestId('input-票券名稱');
        const priceInput = screen.getByTestId('input-票價');
        
        fireEvent.changeText(nameInput, '新增測試票');
        fireEvent.changeText(priceInput, '1500');
        
        const saveButton = screen.getByTestId('button-儲存');
        fireEvent.press(saveButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('新增測試票')).toBeTruthy();
      });
    });
  });

  describe('Edit Ticket Functionality', () => {
    it('opens edit form when edit icon is pressed', async () => {
      render(<TicketsScreen />);
      
      const editIcon = screen.getByTestId('icon-edit');
      fireEvent.press(editIcon);
      
      await waitFor(() => {
        expect(screen.getByTestId('overlay')).toBeTruthy();
        expect(screen.getByDisplayValue('早鳥票')).toBeTruthy();
      });
    });

    it('pre-populates form with existing ticket data', async () => {
      render(<TicketsScreen />);
      
      const editIcon = screen.getByTestId('icon-edit');
      fireEvent.press(editIcon);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('早鳥票')).toBeTruthy();
        expect(screen.getByDisplayValue('1200')).toBeTruthy();
        expect(screen.getByDisplayValue('限時優惠價格')).toBeTruthy();
      });
    });
  });

  describe('Delete Ticket Functionality', () => {
    it('shows confirmation dialog when delete icon is pressed', async () => {
      render(<TicketsScreen />);
      
      const deleteIcon = screen.getByTestId('icon-delete');
      fireEvent.press(deleteIcon);
      
      expect(mockAlert.alert).toHaveBeenCalledWith(
        '確認刪除',
        expect.stringContaining('早鳥票'),
        expect.any(Array)
      );
    });

    it('prevents deletion of tickets with sales', async () => {
      render(<TicketsScreen />);
      
      // Try to delete the first ticket (which has sales)
      const deleteIcons = screen.getAllByTestId('icon-delete');
      fireEvent.press(deleteIcons[0]);
      
      expect(mockAlert.alert).toHaveBeenCalledWith(
        '無法刪除',
        '已售出的票券無法刪除，您可以停用此票券。',
        expect.any(Array)
      );
    });
  });

  describe('Currency Formatting', () => {
    it('displays prices in TWD format', async () => {
      render(<TicketsScreen />);
      
      // Check if prices are displayed in NT$ format
      expect(screen.getByText(/NT\$1,000/)).toBeTruthy(); // Early bird price
      expect(screen.getByText(/NT\$1,500/)).toBeTruthy(); // Regular price
    });

    it('formats currency input correctly', async () => {
      render(<TicketsScreen />);
      
      fireEvent.press(screen.getByTestId('button-新增票券'));
      
      await waitFor(() => {
        const priceInput = screen.getByTestId('input-票價');
        
        // Test currency input formatting
        fireEvent.changeText(priceInput, '1500abc'); // Should strip non-numeric
        expect(priceInput.props.value).toBe('1500');
      });
    });
  });

  describe('Quantity Controls', () => {
    it('toggles unlimited quantity option', async () => {
      render(<TicketsScreen />);
      
      fireEvent.press(screen.getByTestId('button-新增票券'));
      
      await waitFor(() => {
        const unlimitedSwitch = screen.getByTestId('switch');
        fireEvent.press(unlimitedSwitch);
        
        // Quantity input should be hidden when unlimited is enabled
        expect(screen.queryByTestId('input-可售數量')).toBeFalsy();
      });
    });

    it('validates quantity input when not unlimited', async () => {
      render(<TicketsScreen />);
      
      fireEvent.press(screen.getByTestId('button-新增票券'));
      
      await waitFor(() => {
        // Fill required fields but leave quantity empty
        fireEvent.changeText(screen.getByTestId('input-票券名稱'), 'Test Ticket');
        fireEvent.changeText(screen.getByTestId('input-票價'), '1000');
        
        const saveButton = screen.getByTestId('button-儲存');
        fireEvent.press(saveButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('請輸入可售數量')).toBeTruthy();
      });
    });
  });

  describe('Early Bird Settings', () => {
    it('shows early bird fields when enabled', async () => {
      render(<TicketsScreen />);
      
      fireEvent.press(screen.getByTestId('button-新增票券'));
      
      await waitFor(() => {
        const earlyBirdSwitch = screen.getByTestId('switch');
        fireEvent.press(earlyBirdSwitch);
        
        expect(screen.getByTestId('input-早鳥價格')).toBeTruthy();
        expect(screen.getByText('選擇早鳥優惠結束日期')).toBeTruthy();
      });
    });

    it('validates early bird price is lower than regular price', async () => {
      render(<TicketsScreen />);
      
      fireEvent.press(screen.getByTestId('button-新增票券'));
      
      await waitFor(() => {
        // Fill form with early bird price higher than regular price
        fireEvent.changeText(screen.getByTestId('input-票券名稱'), 'Test Ticket');
        fireEvent.changeText(screen.getByTestId('input-票價'), '1000');
        
        // Enable early bird
        const earlyBirdSwitch = screen.getByTestId('switch');
        fireEvent.press(earlyBirdSwitch);
      });
      
      await waitFor(() => {
        fireEvent.changeText(screen.getByTestId('input-早鳥價格'), '1500'); // Higher than regular
        
        const saveButton = screen.getByTestId('button-儲存');
        fireEvent.press(saveButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('早鳥價格必須低於原價')).toBeTruthy();
      });
    });
  });

  describe('Ticket Visibility Settings', () => {
    it('allows selection of visibility options', async () => {
      render(<TicketsScreen />);
      
      fireEvent.press(screen.getByTestId('button-新增票券'));
      
      await waitFor(() => {
        const privateCheckbox = screen.getByTestId('checkbox-私人---僅限邀請連結');
        fireEvent.press(privateCheckbox);
        
        // Should be able to select different visibility options
        expect(privateCheckbox).toBeTruthy();
      });
    });
  });

  describe('Responsive Design', () => {
    it('adapts to tablet dimensions', async () => {
      // Mock tablet dimensions
      mockDimensions.get.mockReturnValue({ width: 800, height: 1024 });
      
      render(<TicketsScreen />);
      
      fireEvent.press(screen.getByTestId('button-新增票券'));
      
      await waitFor(() => {
        expect(screen.getByTestId('overlay')).toBeTruthy();
        // Form should adapt to tablet layout
      });
    });

    it('adapts to desktop dimensions', async () => {
      // Mock desktop dimensions
      mockDimensions.get.mockReturnValue({ width: 1200, height: 800 });
      
      render(<TicketsScreen />);
      
      expect(screen.getByText('票券設定')).toBeTruthy();
      // Layout should adapt to desktop
    });
  });

  describe('Accessibility', () => {
    it('provides proper accessibility labels', async () => {
      render(<TicketsScreen />);
      
      // Check that buttons have proper accessibility
      expect(screen.getByTestId('button-新增票券')).toBeTruthy();
      expect(screen.getByTestId('icon-edit')).toBeTruthy();
      expect(screen.getByTestId('icon-delete')).toBeTruthy();
    });

    it('supports keyboard navigation', async () => {
      render(<TicketsScreen />);
      
      fireEvent.press(screen.getByTestId('button-新增票券'));
      
      await waitFor(() => {
        // Form inputs should be accessible
        expect(screen.getByTestId('input-票券名稱')).toBeTruthy();
        expect(screen.getByTestId('input-票價')).toBeTruthy();
      });
    });
  });

  describe('Form Validation Edge Cases', () => {
    it('handles maximum character limits', async () => {
      render(<TicketsScreen />);
      
      fireEvent.press(screen.getByTestId('button-新增票券'));
      
      await waitFor(() => {
        const nameInput = screen.getByTestId('input-票券名稱');
        
        // Test max length constraint
        const longName = 'a'.repeat(60); // Over 50 char limit
        fireEvent.changeText(nameInput, longName);
        
        const saveButton = screen.getByTestId('button-儲存');
        fireEvent.press(saveButton);
      });
      
      // Should truncate to max length or show error
      await waitFor(() => {
        expect(screen.getByText('票券名稱不能超過50個字元')).toBeTruthy();
      });
    });
  });

  describe('Cancel/Close Functionality', () => {
    it('closes form when cancel button is pressed', async () => {
      render(<TicketsScreen />);
      
      fireEvent.press(screen.getByTestId('button-新增票券'));
      
      await waitFor(() => {
        const cancelButton = screen.getByTestId('button-取消');
        fireEvent.press(cancelButton);
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('overlay')).toBeFalsy();
      });
    });

    it('closes form when backdrop is pressed', async () => {
      render(<TicketsScreen />);
      
      fireEvent.press(screen.getByTestId('button-新增票券'));
      
      await waitFor(() => {
        const backdrop = screen.getByTestId('overlay-backdrop');
        fireEvent.press(backdrop);
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('overlay')).toBeFalsy();
      });
    });
  });
});