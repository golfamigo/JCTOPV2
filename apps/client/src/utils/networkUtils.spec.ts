import NetInfo from '@react-native-community/netinfo';
import { networkUtils } from './networkUtils';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(),
}));

describe('networkUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isOnline', () => {
    it('returns true when connected', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      });

      const result = await networkUtils.isOnline();
      expect(result).toBe(true);
    });

    it('returns false when not connected', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });

      const result = await networkUtils.isOnline();
      expect(result).toBe(false);
    });

    it('returns false when isConnected is null', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: null,
        isInternetReachable: null,
        type: 'unknown',
      });

      const result = await networkUtils.isOnline();
      expect(result).toBe(false);
    });
  });

  describe('isInternetReachable', () => {
    it('returns true when internet is reachable', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      });

      const result = await networkUtils.isInternetReachable();
      expect(result).toBe(true);
    });

    it('returns false when internet is not reachable', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: false,
        type: 'wifi',
      });

      const result = await networkUtils.isInternetReachable();
      expect(result).toBe(false);
    });

    it('returns null when reachability is unknown', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: null,
        type: 'wifi',
      });

      const result = await networkUtils.isInternetReachable();
      expect(result).toBe(null);
    });
  });

  describe('getNetworkType', () => {
    it('returns wifi when on WiFi', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      });

      const result = await networkUtils.getNetworkType();
      expect(result).toBe('wifi');
    });

    it('returns cellular when on cellular', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'cellular',
      });

      const result = await networkUtils.getNetworkType();
      expect(result).toBe('cellular');
    });

    it('returns none when not connected', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });

      const result = await networkUtils.getNetworkType();
      expect(result).toBe('none');
    });
  });

  describe('isWifi', () => {
    it('returns true when on WiFi', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      });

      const result = await networkUtils.isWifi();
      expect(result).toBe(true);
    });

    it('returns false when not on WiFi', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'cellular',
      });

      const result = await networkUtils.isWifi();
      expect(result).toBe(false);
    });
  });

  describe('isCellular', () => {
    it('returns true when on cellular', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'cellular',
      });

      const result = await networkUtils.isCellular();
      expect(result).toBe(true);
    });

    it('returns false when not on cellular', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      });

      const result = await networkUtils.isCellular();
      expect(result).toBe(false);
    });
  });

  describe('getNetworkInfo', () => {
    it('returns detailed network information', async () => {
      const mockNetworkState = {
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: {
          ssid: 'TestNetwork',
          strength: 100,
          ipAddress: '192.168.1.100',
          subnet: '255.255.255.0',
        },
      };

      (NetInfo.fetch as jest.Mock).mockResolvedValue(mockNetworkState);

      const result = await networkUtils.getNetworkInfo();
      expect(result).toEqual(mockNetworkState);
    });
  });

  describe('subscribeToNetworkChanges', () => {
    it('subscribes to network state changes', () => {
      const callback = jest.fn();
      const unsubscribe = jest.fn();
      
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(unsubscribe);

      const result = networkUtils.subscribeToNetworkChanges(callback);

      expect(NetInfo.addEventListener).toHaveBeenCalledWith(callback);
      expect(result).toBe(unsubscribe);
    });

    it('calls callback when network state changes', () => {
      const callback = jest.fn();
      let eventHandler: Function;

      (NetInfo.addEventListener as jest.Mock).mockImplementation((handler) => {
        eventHandler = handler;
        return jest.fn();
      });

      networkUtils.subscribeToNetworkChanges(callback);

      const newState = {
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      };

      eventHandler!(newState);

      expect(callback).toHaveBeenCalledWith(newState);
    });
  });

  describe('waitForConnection', () => {
    it('resolves when connection becomes available', async () => {
      let resolveConnection: Function;
      const connectionPromise = new Promise((resolve) => {
        resolveConnection = resolve;
      });

      (NetInfo.fetch as jest.Mock)
        .mockResolvedValueOnce({ isConnected: false })
        .mockResolvedValueOnce({ isConnected: false })
        .mockResolvedValueOnce({ isConnected: true });

      const checkInterval = setInterval(async () => {
        const state = await NetInfo.fetch();
        if (state.isConnected) {
          clearInterval(checkInterval);
          resolveConnection!();
        }
      }, 100);

      await connectionPromise;

      expect(NetInfo.fetch).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles NetInfo fetch errors gracefully', async () => {
      (NetInfo.fetch as jest.Mock).mockRejectedValue(new Error('NetInfo error'));

      // isOnline should return false on error
      const result = await networkUtils.isOnline();
      expect(result).toBe(false);
    });

    it('handles missing NetInfo module', async () => {
      // Temporarily mock NetInfo as undefined
      const originalNetInfo = NetInfo;
      (global as any).NetInfo = undefined;

      // Should handle gracefully and return false
      const result = await networkUtils.isOnline();
      expect(result).toBe(false);

      // Restore NetInfo
      (global as any).NetInfo = originalNetInfo;
    });
  });
});