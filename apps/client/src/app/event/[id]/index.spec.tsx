import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert, Share, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock apiClient before importing components that use it
jest.mock('../../../services/apiClient', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  setAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
  getAuthToken: jest.fn(),
}));

import EventDetailScreen from './index';
import eventService from '../../../services/eventService';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
  useLocalSearchParams: () => ({ id: 'test-event-id' }),
  Stack: {
    Screen: ({ children }: any) => children,
  },
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        'eventDetail.loadError': '無法載入活動詳情',
        'eventDetail.notFound': '找不到活動',
        'eventDetail.share': '分享',
        'eventDetail.favorite': '收藏',
        'eventDetail.favorited': '已收藏',
        'eventDetail.favoriteError': '無法更新收藏狀態',
        'eventDetail.linkCopied': '連結已複製到剪貼簿',
        'eventDetail.aboutEvent': '關於活動',
        'eventDetail.eventDetails': '活動詳情',
        'eventDetail.ticketTypes': '票種資訊',
        'eventDetail.location': '位置資訊',
        'eventDetail.startTime': '開始時間',
        'eventDetail.endTime': '結束時間',
        'eventDetail.capacity': '活動容量',
        'eventDetail.availableSeats': '個可用座位',
        'eventDetail.categories': '活動分類',
        'eventDetail.remaining': `剩餘 ${options?.count || 0} 張`,
        'eventDetail.buyNow': '立即購買',
        'eventDetail.soldOut': '售完',
        'eventDetail.earlyBird': '早鳥優惠',
        'eventDetail.noLocation': '地點待定',
        'eventDetail.mapPlaceholder': '地圖載入中',
        'eventDetail.getDirections': '取得路線',
        'eventDetail.status.upcoming': '即將開始',
        'eventDetail.status.ongoing': '進行中',
        'eventDetail.status.ended': '已結束',
        'common.error': '錯誤',
        'common.success': '成功',
        'common.back': '返回',
        'common.showMore': '顯示更多',
        'common.showLess': '顯示較少',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('../../../services/eventService');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock React Native Elements components
jest.mock('@rneui/themed', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } = require('react-native');
  
  return {
    ThemeProvider: ({ children }: any) => <View testID="theme-provider">{children}</View>,
    Image: ({ source, PlaceholderContent, ...props }: any) => 
      PlaceholderContent || <View testID="event-image" {...props} />,
    Text: ({ children, h1, h2, h3, ...props }: any) => {
      const style = h1 ? { fontSize: 24, fontWeight: 'bold' } : 
                   h2 ? { fontSize: 20, fontWeight: 'bold' } :
                   h3 ? { fontSize: 18, fontWeight: '600' } : {};
      return <Text style={style} {...props}>{children}</Text>;
    },
    Card: ({ children, containerStyle, ...props }: any) => 
      <View testID="card" style={containerStyle} {...props}>{children}</View>,
    ListItem: ({ children, bottomDivider, ...props }: any) => 
      <View {...props}>{children}</View>,
    'ListItem.Content': ({ children }: any) => <View>{children}</View>,
    'ListItem.Title': ({ children, style }: any) => <Text style={style}>{children}</Text>,
    'ListItem.Subtitle': ({ children, style }: any) => <Text style={style}>{children}</Text>,
    Button: ({ title, onPress, loading, testID, icon, ...props }: any) => (
      <TouchableOpacity onPress={onPress} testID={testID} {...props}>
        {loading ? <ActivityIndicator /> : <Text>{title}</Text>}
        {icon}
      </TouchableOpacity>
    ),
    Icon: ({ name, type, onPress, testID, ...props }: any) => (
      <TouchableOpacity onPress={onPress} testID={testID || `icon-${name}`} {...props}>
        <Text>{name}</Text>
      </TouchableOpacity>
    ),
    Badge: ({ value, ...props }: any) => <View {...props}><Text>{value}</Text></View>,
    Skeleton: () => <View testID="skeleton" />,
    PricingCard: ({ title, price, info, button, testID, ...props }: any) => (
      <View testID={testID} {...props}>
        <Text>{title}</Text>
        <Text>{price}</Text>
        {info && info.map((item: string, index: number) => (
          <Text key={index}>{item}</Text>
        ))}
        {button && (
          <TouchableOpacity onPress={button.onPress} testID={`${testID}-button`}>
            <Text>{button.title}</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
  };
});

const mockEvent = {
  id: 'test-event-id',
  title: '測試活動',
  description: '這是一個測試活動的描述，包含了詳細的活動資訊。這個描述很長，需要測試展開和收合功能。',
  startDate: '2025-03-15T14:00:00Z',
  endDate: '2025-03-15T18:00:00Z',
  imageUrl: 'https://example.com/event-image.jpg',
  location: {
    address: '台北市信義區信義路五段7號',
    latitude: 25.0330,
    longitude: 121.5654,
  },
  organizer: {
    id: 'org-1',
    name: '測試主辦方',
  },
  capacity: 100,
  remainingCapacity: 75,
  categories: ['音樂', '藝術'],
  ticketTypes: [
    {
      id: 'ticket-1',
      name: '早鳥票',
      price: 500,
      description: '限量早鳥優惠票',
      quantity: 50,
      remaining: 10,
      isEarlyBird: true,
    },
    {
      id: 'ticket-2',
      name: '一般票',
      price: 800,
      description: '一般入場票券',
      quantity: 100,
      remaining: 65,
      isEarlyBird: false,
    },
    {
      id: 'ticket-3',
      name: 'VIP票',
      price: 1500,
      description: 'VIP專屬席位',
      quantity: 20,
      remaining: 0,
      isEarlyBird: false,
    },
  ],
};

describe('EventDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert = jest.fn();
    Share.share = jest.fn();
    Linking.openURL = jest.fn();
  });

  describe('Loading State', () => {
    it('should display loading skeletons while fetching event data', async () => {
      (eventService.getPublicEventById as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      );

      const { getAllByTestId } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error State', () => {
    it('should display error message when event loading fails', async () => {
      const errorMessage = 'Network error';
      (eventService.getPublicEventById as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { getByText } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        expect(getByText('找不到活動')).toBeTruthy();
        expect(getByText('返回')).toBeTruthy();
      });
      
      expect(Alert.alert).toHaveBeenCalledWith('錯誤', errorMessage);
    });

    it('should navigate back when back button is pressed in error state', async () => {
      (eventService.getPublicEventById as jest.Mock).mockRejectedValue(new Error('Error'));
      const mockRouter = { back: jest.fn(), push: jest.fn() };
      
      jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue(mockRouter);

      const { getByText } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        const backButton = getByText('返回');
        fireEvent.press(backButton);
      });
      
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  describe('Event Display', () => {
    beforeEach(() => {
      (eventService.getPublicEventById as jest.Mock).mockResolvedValue(mockEvent);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    });

    it('should display event title and basic information', async () => {
      const { getByText } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        expect(getByText('測試活動')).toBeTruthy();
        expect(getByText('2025年3月15日 14:00')).toBeTruthy();
        expect(getByText('台北市信義區信義路五段7號')).toBeTruthy();
        expect(getByText('測試主辦方')).toBeTruthy();
      });
    });

    it('should display event description with expand/collapse functionality', async () => {
      const { getByText } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        expect(getByText(/這是一個測試活動的描述/)).toBeTruthy();
        const showMoreButton = getByText('顯示更多');
        expect(showMoreButton).toBeTruthy();
        
        fireEvent.press(showMoreButton);
      });
      
      await waitFor(() => {
        expect(getByText('顯示較少')).toBeTruthy();
      });
    });

    it('should display event status badge correctly', async () => {
      const { getByText } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        // Since the event date is in the future, it should show "upcoming"
        expect(getByText('即將開始')).toBeTruthy();
      });
    });

    it('should display event categories', async () => {
      const { getByText } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        expect(getByText('音樂')).toBeTruthy();
        expect(getByText('藝術')).toBeTruthy();
      });
    });

    it('should display capacity information', async () => {
      const { getByText } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        expect(getByText('75/100 個可用座位')).toBeTruthy();
      });
    });
  });

  describe('Ticket Display', () => {
    beforeEach(() => {
      (eventService.getPublicEventById as jest.Mock).mockResolvedValue(mockEvent);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    });

    it('should display all ticket types with correct information', async () => {
      const { getByText } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        // Early bird ticket
        expect(getByText('早鳥票')).toBeTruthy();
        expect(getByText('NT$ 500')).toBeTruthy();
        expect(getByText('限量早鳥優惠票')).toBeTruthy();
        expect(getByText('剩餘 10 張')).toBeTruthy();
        
        // Regular ticket
        expect(getByText('一般票')).toBeTruthy();
        expect(getByText('NT$ 800')).toBeTruthy();
        expect(getByText('剩餘 65 張')).toBeTruthy();
        
        // VIP ticket (sold out)
        expect(getByText('VIP票')).toBeTruthy();
        expect(getByText('NT$ 1,500')).toBeTruthy();
        expect(getByText('售完')).toBeTruthy();
      });
    });

    it('should display early bird badge for early bird tickets', async () => {
      const { getByText } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        expect(getByText('早鳥優惠')).toBeTruthy();
      });
    });

    it('should navigate to registration when buy button is pressed', async () => {
      const mockRouter = { back: jest.fn(), push: jest.fn() };
      jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue(mockRouter);

      const { getByTestId } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        const buyButton = getByTestId('pricing-card-ticket-1-button');
        fireEvent.press(buyButton);
      });
      
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: '/event/[id]/register',
        params: { id: 'test-event-id', ticketTypeId: 'ticket-1' }
      });
    });

    it('should display PricingCard components with correct testIDs', async () => {
      const { getByTestId } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        expect(getByTestId('pricing-card-ticket-1')).toBeTruthy();
        expect(getByTestId('pricing-card-ticket-2')).toBeTruthy();
        expect(getByTestId('pricing-card-ticket-3')).toBeTruthy();
      });
    });
  });

  describe('Share and Favorite Features', () => {
    beforeEach(() => {
      (eventService.getPublicEventById as jest.Mock).mockResolvedValue(mockEvent);
    });

    it('should handle share functionality', async () => {
      (Share.share as jest.Mock).mockResolvedValue({ action: 'sharedAction' });
      
      const { getByTestId } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        const shareButton = getByTestId('share-button');
        fireEvent.press(shareButton);
      });
      
      expect(Share.share).toHaveBeenCalledWith({
        message: expect.stringContaining('測試活動'),
        title: '測試活動',
      });
    });

    it('should toggle favorite status', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      const { getByTestId, getByText } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        const favoriteButton = getByTestId('favorite-button');
        expect(getByText('收藏')).toBeTruthy();
        
        fireEvent.press(favoriteButton);
      });
      
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'favoriteEvents',
          JSON.stringify(['test-event-id'])
        );
        expect(getByText('已收藏')).toBeTruthy();
      });
    });

    it('should load existing favorite status', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(['test-event-id'])
      );
      
      const { getByText } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        expect(getByText('已收藏')).toBeTruthy();
      });
    });
  });

  describe('Location Features', () => {
    beforeEach(() => {
      (eventService.getPublicEventById as jest.Mock).mockResolvedValue(mockEvent);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    });

    it('should display location information', async () => {
      const { getByText } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        expect(getByText('位置資訊')).toBeTruthy();
        expect(getByText('台北市信義區信義路五段7號')).toBeTruthy();
        expect(getByText('取得路線')).toBeTruthy();
      });
    });

    it('should open directions when directions button is pressed', async () => {
      const { getByTestId } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        const directionsButton = getByTestId('directions-button');
        fireEvent.press(directionsButton);
      });
      
      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('25.0330')
      );
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      (eventService.getPublicEventById as jest.Mock).mockResolvedValue(mockEvent);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    });

    it('should navigate back when back button is pressed', async () => {
      const mockRouter = { back: jest.fn(), push: jest.fn() };
      jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue(mockRouter);

      const { getByTestId } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        const backButton = getByTestId('back-button');
        fireEvent.press(backButton);
      });
      
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  describe('Responsive Layout', () => {
    it('should adapt layout for tablet screens', async () => {
      // Mock tablet dimensions
      jest.spyOn(require('react-native'), 'Dimensions', 'get').mockReturnValue({
        get: () => ({ width: 800, height: 600 }),
      });

      (eventService.getPublicEventById as jest.Mock).mockResolvedValue(mockEvent);
      
      const { getByText } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        // Component should render without errors on tablet
        expect(getByText('測試活動')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (eventService.getPublicEventById as jest.Mock).mockResolvedValue(mockEvent);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    });

    it('should have proper testID attributes for key interactive elements', async () => {
      const { getByTestId } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        expect(getByTestId('back-button')).toBeTruthy();
        expect(getByTestId('share-button')).toBeTruthy();
        expect(getByTestId('favorite-button')).toBeTruthy();
        expect(getByTestId('directions-button')).toBeTruthy();
        expect(getByTestId('buy-ticket-ticket-1')).toBeTruthy();
      });
    });
  });

  describe('Traditional Chinese Formatting', () => {
    beforeEach(() => {
      (eventService.getPublicEventById as jest.Mock).mockResolvedValue(mockEvent);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    });

    it('should format dates in Traditional Chinese format', async () => {
      const { getByText } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        // Check date format: YYYY年MM月DD日 HH:mm
        expect(getByText('2025年3月15日 14:00')).toBeTruthy();
      });
    });

    it('should format currency with NT$ prefix', async () => {
      const { getByText } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        expect(getByText('NT$ 500')).toBeTruthy();
        expect(getByText('NT$ 800')).toBeTruthy();
        expect(getByText('NT$ 1,500')).toBeTruthy();
      });
    });

    it('should display all text in Traditional Chinese', async () => {
      const { getByText } = render(<EventDetailScreen />);
      
      await waitFor(() => {
        expect(getByText('關於活動')).toBeTruthy();
        expect(getByText('活動詳情')).toBeTruthy();
        expect(getByText('票種資訊')).toBeTruthy();
        expect(getByText('位置資訊')).toBeTruthy();
        expect(getByText('立即購買')).toBeTruthy();
        expect(getByText('分享')).toBeTruthy();
        expect(getByText('收藏')).toBeTruthy();
      });
    });
  });
});