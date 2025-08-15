import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { theme } from '../theme';

// Initialize test i18n instance
const testI18n = i18n.createInstance();
testI18n.init({
  lng: 'zh-TW',
  fallbackLng: 'zh-TW',
  ns: ['common', 'events', 'auth', 'payment'],
  defaultNS: 'common',
  resources: {
    'zh-TW': {
      common: {
        // Add test translations as needed
        login: '登入',
        register: '註冊',
        submit: '提交',
        cancel: '取消',
        save: '儲存',
        delete: '刪除',
        edit: '編輯',
        loading: '載入中...',
        error: '錯誤',
        success: '成功',
        confirm: '確認',
        back: '返回',
      },
      events: {
        title: '活動標題',
        register: '立即報名',
        viewDetails: '查看詳情',
      },
      auth: {
        loginTitle: '登入',
        registerTitle: '註冊',
        forgotPassword: '忘記密碼',
      },
      payment: {
        pay: '付款',
        processing: '處理中',
        success: '付款成功',
        failed: '付款失敗',
      }
    }
  },
  interpolation: {
    escapeValue: false
  }
});

interface AllTheProvidersProps {
  children: React.ReactNode;
}

// All providers wrapper for testing
const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={testI18n}>
        {children}
      </I18nextProvider>
    </ThemeProvider>
  );
};

// Custom render method that includes all providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => rtlRender(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react-native';
export { customRender as render, testI18n };

// Mock helpers for React Native Elements components
export const mockTheme = theme;

export const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  replace: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  canGoBack: jest.fn(() => true),
  getParent: jest.fn(),
  getState: jest.fn(),
  setOptions: jest.fn(),
});

export const createMockRoute = (params = {}) => ({
  key: 'test-route-key',
  name: 'TestRoute',
  params,
});

// Utility for testing async operations with proper cleanup
export const waitForAsync = async (callback: () => void | Promise<void>, timeout = 5000) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Async operation timeout')), timeout);
  });
  
  const callbackPromise = Promise.resolve(callback());
  
  return Promise.race([callbackPromise, timeoutPromise]);
};

// Utility for mocking fetch responses
export const mockFetchResponse = (data: any, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    } as Response)
  );
};

// Utility for cleaning up test timers
export const cleanupTimers = () => {
  jest.clearAllTimers();
  jest.useRealTimers();
};