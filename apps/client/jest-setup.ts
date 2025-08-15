import '@testing-library/react-native/extend-expect';

// Set environment variables for tests
process.env.EXPO_PUBLIC_API_URL = 'https://jctop.zeabur.app/api/v1';

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

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock react-native-chart-kit
jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
  BarChart: 'BarChart', 
  PieChart: 'PieChart',
  ContributionGraph: 'ContributionGraph',
  StackedBarChart: 'StackedBarChart',
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
  Ionicons: 'Ionicons',
  Feather: 'Feather',
  AntDesign: 'AntDesign',
  Entypo: 'Entypo',
  EvilIcons: 'EvilIcons',
  Foundation: 'Foundation',
  Octicons: 'Octicons',
  SimpleLineIcons: 'SimpleLineIcons',
  Zocial: 'Zocial',
}));

// Mock @rneui/themed components
jest.mock('@rneui/themed', () => {
  const React = require('react');
  const actualModule = jest.requireActual('@rneui/themed');
  
  // 預設的測試主題
  const mockTheme = {
    colors: {
      primary: '#007BFF',
      secondary: '#6C757D',
      success: '#28A745',
      warning: '#FFC107',
      error: '#DC3545',
      background: '#FFFFFF',
      white: '#FFFFFF',
      black: '#000000',
      grey0: '#393E42',
      grey1: '#43484D',
      grey2: '#5E6977',
      grey3: '#86939E',
      grey4: '#BDC6CF',
      grey5: '#E1E8EE',
      disabled: '#E0E0E0',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
    },
  };

  return {
    ...actualModule,
    Button: ({ title, children, ...props }) => 
      React.createElement('Button', props, title || children),
    Input: 'Input',
    Text: ({ children, ...props }) => 
      React.createElement('Text', props, children),
    Overlay: ({ children, ...props }) => 
      React.createElement('Overlay', props, children),
    Card: 'Card',
    Divider: 'Divider',
    CheckBox: ({ title, ...props }) => 
      React.createElement('CheckBox', { ...props, role: 'checkbox' }, title),
    ListItem: Object.assign('ListItem', {
      Swipeable: 'ListItemSwipeable',
      Content: 'ListItemContent',
      Title: 'ListItemTitle',
      Subtitle: 'ListItemSubtitle',
      Chevron: 'ListItemChevron',
    }),
    LinearProgress: 'LinearProgress',
    Icon: 'Icon',
    Avatar: 'Avatar',
    FAB: 'FAB',
    Tab: Object.assign('Tab', {
      Item: 'TabItem',
    }),
    TabView: Object.assign('TabView', {
      Item: 'TabViewItem',
    }),
    Skeleton: ({ testID, ...props }) => React.createElement('Skeleton', { testID: testID || 'RNE__Skeleton', ...props }),
    useTheme: jest.fn(() => ({ 
      theme: mockTheme,
      replaceTheme: jest.fn(),
      updateTheme: jest.fn(),
    })),
    ThemeProvider: ({ children, theme }) => React.createElement('ThemeProvider', { theme: theme || mockTheme }, children),
    createTheme: jest.fn((config) => ({
      ...mockTheme,
      ...config,
      lightColors: {
        ...mockTheme.colors,
        ...(config?.lightColors || {}),
      },
      darkColors: {
        ...mockTheme.colors,
        ...(config?.darkColors || {}),
      },
      mode: config?.mode || 'light',
    })),
  };
});

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