import '@testing-library/react-native/extend-expect';

// Mock AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
}));

// Clear AsyncStorage mocks before each test
beforeEach(() => {
  (AsyncStorage.getItem as jest.Mock).mockClear();
  (AsyncStorage.setItem as jest.Mock).mockClear();
  (AsyncStorage.removeItem as jest.Mock).mockClear();
  (AsyncStorage.multiRemove as jest.Mock).mockClear();
  (AsyncStorage.clear as jest.Mock).mockClear();
  (AsyncStorage.getAllKeys as jest.Mock).mockClear();
  (AsyncStorage.multiGet as jest.Mock).mockClear();
  (AsyncStorage.multiSet as jest.Mock).mockClear();
});