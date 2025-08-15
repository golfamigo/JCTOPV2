module.exports = {
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    setParams: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  useSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => []),
  usePathname: jest.fn(() => '/'),
  useNavigationContainerRef: jest.fn(),
  useRootNavigation: jest.fn(),
  useRootNavigationState: jest.fn(),
  Link: ({ children }) => children,
  Redirect: () => null,
  Stack: {
    Screen: ({ children }) => children,
  },
  Tabs: {
    Screen: ({ children }) => children,
  },
};