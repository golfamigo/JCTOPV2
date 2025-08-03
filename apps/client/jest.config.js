module.exports = {
  // Use different configs for different test types
  testEnvironment: 'jsdom',
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
        'node_modules/(?!(@chakra-ui|framer-motion|@emotion)/)',
      ],
      setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/jest-setup-web.ts'],
      moduleNameMapper: {
        '^@jctop-event/shared-types$': '<rootDir>/../../../packages/shared-types/src/index.ts',
        '^react-native$': 'react-native-web',
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
        'node_modules/(?!(react-native|@react-native|@testing-library/react-native|@react-navigation|@expo|expo|expo-auth-session|expo-crypto|react-native-web)/)',
      ],
      setupFilesAfterEnv: ['@testing-library/react-native/extend-expect', '<rootDir>/jest-setup.ts'],
      moduleNameMapper: {
        '^@jctop-event/shared-types$': '<rootDir>/../../../packages/shared-types/src/index.ts',
      },
    },
  ],
};