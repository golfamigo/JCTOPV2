import '@testing-library/jest-dom';
import 'text-encoding-polyfill';

// Add TextEncoder/TextDecoder polyfills for jsdom
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock AsyncStorage for web tests
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Clear AsyncStorage mocks before each test
beforeEach(() => {
  Object.values(mockAsyncStorage).forEach(mock => mock.mockClear());
});

// Mock react-native-web components if needed
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});