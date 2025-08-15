module.exports = {
  // Use different configs for different test types
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/test-utils/**',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  projects: [
    {
      displayName: 'web-components',
      testMatch: [
        '<rootDir>/src/components/features/auth/LoginForm.spec.tsx',
        '<rootDir>/src/components/features/auth/GoogleSignInButton.spec.tsx',
        '<rootDir>/src/components/features/auth/RegisterForm.spec.tsx',
        '<rootDir>/src/components/features/auth/ForgotPasswordForm.spec.tsx',
        '<rootDir>/src/components/features/auth/ResetPasswordForm.spec.tsx',
        '<rootDir>/src/components/features/event/EventCreateForm.spec.tsx',
        '<rootDir>/src/components/features/event/TicketConfiguration.spec.tsx',
        '<rootDir>/src/components/features/event/SeatingConfiguration.spec.tsx',
        '<rootDir>/src/components/features/event/EventCard.spec.tsx',
        '<rootDir>/src/components/features/event/EventsList.spec.tsx',
        '<rootDir>/src/components/features/event/TicketQuantityPicker.spec.tsx',
        '<rootDir>/src/components/features/event/TicketTypeSelector.spec.tsx',
        '<rootDir>/src/components/features/event/RegistrationStepOne.spec.tsx',
        '<rootDir>/src/components/ui/Pagination.spec.tsx',
        '<rootDir>/src/components/features/organizer/AttendeeManagementPage.spec.tsx',
        '<rootDir>/src/services/attendeeService.spec.ts'
      ],
      testEnvironment: 'jsdom',
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      transform: {
        '^.+\\.(ts|tsx)$': 'babel-jest',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(@chakra-ui|framer-motion|@emotion|@rneui|react-native|@react-native|@react-native-community|expo|@expo|expo-.*|react-native-.*|@react-navigation)/)',
      ],
      setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/jest-setup-web.ts'],
      moduleNameMapper: {
        '^@jctop-event/shared-types$': '<rootDir>/../../packages/shared-types/src/index.ts',
        '^@shared/types$': '<rootDir>/../../packages/shared-types/src/index.ts',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^react-native$': 'react-native-web',
        '^react-native-safe-area-context$': '<rootDir>/__mocks__/react-native-safe-area-context.js',
        '^expo-router$': '<rootDir>/__mocks__/expo-router.js',
        '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
      },
    },
    {
      displayName: 'react-native',
      preset: 'react-native',
      testMatch: ['**/*.(test|spec).(ts|tsx|js|jsx)'],
      testPathIgnorePatterns: [
        '<rootDir>/src/components/features/auth/LoginForm.spec.tsx',
        '<rootDir>/src/components/features/auth/GoogleSignInButton.spec.tsx',
        '<rootDir>/src/components/features/auth/RegisterForm.spec.tsx',
        '<rootDir>/src/components/features/auth/ForgotPasswordForm.spec.tsx',
        '<rootDir>/src/components/features/auth/ResetPasswordForm.spec.tsx',
        '<rootDir>/src/components/features/event/EventCreateForm.spec.tsx',
        '<rootDir>/src/components/features/event/TicketConfiguration.spec.tsx',
        '<rootDir>/src/components/features/event/SeatingConfiguration.spec.tsx',
        '<rootDir>/src/components/features/event/EventCard.spec.tsx',
        '<rootDir>/src/components/features/event/EventsList.spec.tsx',
        '<rootDir>/src/components/features/event/TicketQuantityPicker.spec.tsx',
        '<rootDir>/src/components/features/event/TicketTypeSelector.spec.tsx',
        '<rootDir>/src/components/features/event/RegistrationStepOne.spec.tsx',
        '<rootDir>/src/components/ui/Pagination.spec.tsx',
        '<rootDir>/src/components/features/organizer/AttendeeManagementPage.spec.tsx',
        '<rootDir>/src/services/attendeeService.spec.ts'
      ],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      transform: {
        '^.+\\.(ts|tsx)$': 'babel-jest',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|@react-native-community|@testing-library/react-native|@react-navigation|@expo|expo|expo-auth-session|expo-crypto|react-native-web|@rneui/base|@rneui/themed|react-i18next|i18next|react-native-size-matters|react-native-ratings|react-native-chart-kit|react-native-svg)/)',
      ],
      setupFilesAfterEnv: ['@testing-library/react-native/extend-expect', '<rootDir>/jest-setup.ts'],
      moduleNameMapper: {
        '^@jctop-event/shared-types$': '<rootDir>/../../../packages/shared-types/src/index.ts',
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
  ],
};