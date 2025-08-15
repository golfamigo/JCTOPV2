import { renderHook, act } from '@testing-library/react-native';
import { Dimensions, EmitterSubscription } from 'react-native';
import { useResponsive } from './useResponsive';

jest.mock('react-native-device-info', () => ({
  isTablet: jest.fn(() => false),
}));

describe('useResponsive', () => {
  let mockSubscription: EmitterSubscription;
  let dimensionChangeHandler: (dims: { window: { width: number; height: number } }) => void;

  beforeEach(() => {
    mockSubscription = {
      remove: jest.fn(),
    } as any;

    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 375,
      height: 812,
      scale: 2,
      fontScale: 1,
    });

    jest.spyOn(Dimensions, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'change') {
        dimensionChangeHandler = handler;
      }
      return mockSubscription;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return initial dimensions', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.width).toBe(375);
    expect(result.current.height).toBe(812);
  });

  it('should identify device type correctly', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.deviceType).toBe('mobile');
    expect(result.current.isPhone).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should identify orientation correctly', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isPortrait).toBe(true);
    expect(result.current.isLandscape).toBe(false);
  });

  it('should update on dimension change', () => {
    const { result } = renderHook(() => useResponsive());

    act(() => {
      dimensionChangeHandler({
        window: { width: 1024, height: 768 },
      });
    });

    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
    expect(result.current.deviceType).toBe('tablet');
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isLandscape).toBe(true);
  });

  it('should provide getResponsiveValue function', () => {
    const { result } = renderHook(() => useResponsive());

    const values = {
      mobile: 'mobile-value',
      tablet: 'tablet-value',
      desktop: 'desktop-value',
    };

    expect(result.current.getResponsiveValue(values)).toBe('mobile-value');

    act(() => {
      dimensionChangeHandler({
        window: { width: 800, height: 600 },
      });
    });

    expect(result.current.getResponsiveValue(values)).toBe('tablet-value');
  });

  it('should provide responsiveSize function', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.responsiveSize(10)).toBe(10);

    act(() => {
      dimensionChangeHandler({
        window: { width: 800, height: 600 },
      });
    });

    // On tablet, default scale factor is 1.2, so 10 * 1.2 = 12
    const tabletResult = result.current.responsiveSize(10);
    expect(tabletResult).toBe(12);
  });

  it('should detect platform correctly', () => {
    const { result } = renderHook(() => useResponsive());

    expect(typeof result.current.isIOS).toBe('boolean');
    expect(typeof result.current.isAndroid).toBe('boolean');
    expect(typeof result.current.isIPad).toBe('boolean');
    expect(typeof result.current.isIPhone).toBe('boolean');
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useResponsive());

    unmount();

    expect(mockSubscription.remove).toHaveBeenCalled();
  });

  it('should handle desktop dimensions', () => {
    const { result } = renderHook(() => useResponsive());

    act(() => {
      dimensionChangeHandler({
        window: { width: 1920, height: 1080 },
      });
    });

    expect(result.current.deviceType).toBe('desktop');
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isPhone).toBe(false);
  });
});