# Component Library Documentation

## Overview

This document provides comprehensive documentation of the React Native Elements component library implementation following the frontend specification requirements. All components follow Atomic Design principles and adhere to WCAG 2.1 AA accessibility standards.

## Table of Contents

1. [Design System Foundation](#design-system-foundation)
2. [Component Inventory](#component-inventory)
3. [Atomic Design Architecture](#atomic-design-architecture)
4. [Theme Integration](#theme-integration)
5. [Accessibility Patterns](#accessibility-patterns)
6. [Localization Guidelines](#localization-guidelines)
7. [Testing Patterns](#testing-patterns)
8. [Migration Reference](#migration-reference)

## Design System Foundation

### Color Palette

Following the frontend specification, all components use this standardized color palette:

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary | #007BFF | Action buttons, links, focus states |
| White | #FFFFFF | Card backgrounds, input backgrounds |
| Light Grey | #F8F9FA | Skeleton loading, disabled states |
| Mid Grey | #6C757D | Secondary text, borders |
| Dark | #212529 | Primary text, icons |
| Success | #28A745 | Success messages, positive states |
| Danger | #DC3545 | Error messages, destructive actions |
| Warning | #FFC107 | Warning messages, caution states |

### Typography Hierarchy

Consistent typography system based on 8pt grid:

| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| H1 | 24pt | Bold | Page titles, major headings |
| H2 | 20pt | Bold | Section headers, component titles |
| Body | 16pt | Regular | Default text, descriptions |
| Small | 14pt | Regular | Helper text, captions |

### Spacing System

8pt grid spacing system for consistent layouts:

- xs: 4px (0.5x)
- sm: 8px (1x) 
- md: 16px (2x)
- lg: 24px (3x)
- xl: 32px (4x)
- xxl: 40px (5x)
- xxxl: 48px (6x)

### Responsive Breakpoints

| Breakpoint | Range | Usage |
|------------|-------|-------|
| Mobile | <768px | Phone devices, bottom tab navigation |
| Tablet | ≥768px | Tablet devices, adaptive layouts |
| Desktop | ≥1200px | Web browsers, side navigation |

## Component Inventory

### Atoms (Basic Building Blocks)

#### LoadingSkeleton
**Location**: `apps/client/src/components/atoms/LoadingSkeleton.tsx`
**Purpose**: Provides skeleton loading states during data fetching
**Props**:
- `width`: number | string - Skeleton width
- `height`: number | string - Skeleton height  
- `variant`: 'text' | 'rectangular' | 'circular' - Skeleton shape
- `testID`: string - Accessibility test identifier

**Usage Example**:
```tsx
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton';

<LoadingSkeleton 
  width="100%" 
  height={20} 
  variant="text" 
  testID="skeleton-title" 
/>
```

### Molecules (Component Combinations)

#### ErrorCard
**Location**: `apps/client/src/components/molecules/ErrorCard.tsx`  
**Purpose**: Displays error messages with retry functionality
**Props**:
- `error`: Error | string - Error object or message
- `onRetry`: () => void - Retry callback function
- `containerStyle`: StyleProp<ViewStyle> - Custom container styling
- `testID`: string - Accessibility test identifier

**Usage Example**:
```tsx
import { ErrorCard } from '@/components/molecules/ErrorCard';

<ErrorCard
  error="網路連線錯誤"
  onRetry={() => refetch()}
  testID="error-card"
/>
```

#### NetworkStatusIndicator  
**Location**: `apps/client/src/components/molecules/NetworkStatusIndicator.tsx`
**Purpose**: Shows network connectivity status
**Props**:
- `isVisible`: boolean - Controls visibility
- `position`: 'top' | 'bottom' - Screen position
- `testID`: string - Accessibility test identifier

#### PasswordStrengthIndicator
**Location**: `apps/client/src/components/molecules/PasswordStrengthIndicator.tsx`
**Purpose**: Visual password strength feedback
**Props**:
- `password`: string - Password to evaluate
- `showLabel`: boolean - Show strength label
- `testID`: string - Accessibility test identifier

### Organisms (Complex Components)

#### ErrorBoundary
**Location**: `apps/client/src/components/organisms/ErrorBoundary.tsx`
**Purpose**: Catches JavaScript errors and displays fallback UI
**Props**:
- `children`: React.ReactNode - Child components to monitor
- `fallbackComponent`: React.ComponentType - Custom error fallback
- `onError`: (error: Error, errorInfo: ErrorInfo) => void - Error callback

#### LoadingOverlay
**Location**: `apps/client/src/components/organisms/LoadingOverlay.tsx`
**Purpose**: Full-screen loading overlay with multiple variants
**Props**:
- `visible`: boolean - Controls overlay visibility
- `variant`: 'spinner' | 'skeleton' | 'dots' - Loading animation type
- `message`: string - Optional loading message
- `testID`: string - Accessibility test identifier

#### ErrorOverlay
**Location**: `apps/client/src/components/organisms/ErrorOverlay.tsx`
**Purpose**: Full-screen error display with recovery options
**Props**:
- `visible`: boolean - Controls overlay visibility
- `error`: Error | string - Error to display
- `onRetry`: () => void - Retry action callback
- `onDismiss`: () => void - Dismiss overlay callback

#### NavigationHeader
**Location**: `apps/client/src/components/organisms/NavigationHeader.tsx`
**Purpose**: Consistent navigation header across screens
**Props**:
- `title`: string - Header title
- `showBack`: boolean - Show back button
- `rightActions`: React.ReactNode[] - Right-side action buttons
- `testID`: string - Accessibility test identifier

### Feature Components

#### Authentication Forms

##### LoginForm
**Location**: `apps/client/src/components/features/auth/LoginForm.tsx`
**Purpose**: User login with email/password
**Props**:
- `onSubmit`: (credentials: LoginData) => Promise<void>
- `loading`: boolean - Form submission state
- `error`: string | null - Authentication error message

##### RegisterForm  
**Location**: `apps/client/src/components/features/auth/RegisterForm.tsx`
**Purpose**: User registration with validation
**Props**:
- `onSubmit`: (userData: RegisterData) => Promise<void>
- `loading`: boolean - Form submission state
- `error`: string | null - Registration error message

##### ProfilePage
**Location**: `apps/client/src/components/features/auth/ProfilePage.tsx`
**Purpose**: User profile management interface
**Props**:
- `user`: User - Current user data
- `onUpdate`: (userData: UpdateUserData) => Promise<void>
- `loading`: boolean - Update operation state

##### ForgotPasswordForm
**Location**: `apps/client/src/components/features/auth/ForgotPasswordForm.tsx`
**Purpose**: Password reset request form
**Props**:
- `onSubmit`: (email: string) => Promise<void>
- `loading`: boolean - Request submission state

##### ResetPasswordForm
**Location**: `apps/client/src/components/features/auth/ResetPasswordForm.tsx`
**Purpose**: New password creation form
**Props**:
- `token`: string - Password reset token
- `onSubmit`: (password: string) => Promise<void>
- `loading`: boolean - Reset operation state

## Atomic Design Architecture

### Structure Overview

```
components/
├── atoms/           # Basic building blocks
│   ├── LoadingSkeleton.tsx
│   └── LoadingSkeleton.spec.tsx
├── molecules/       # Simple component combinations  
│   ├── ErrorCard.tsx
│   ├── NetworkStatusIndicator.tsx
│   └── PasswordStrengthIndicator.tsx
├── organisms/       # Complex UI sections
│   ├── ErrorBoundary.tsx
│   ├── LoadingOverlay.tsx
│   ├── ErrorOverlay.tsx
│   └── NavigationHeader.tsx
└── features/        # Domain-specific components
    ├── auth/        # Authentication components
    ├── event/       # Event management components
    ├── organizer/   # Organizer dashboard components
    ├── registration/# Registration flow components
    └── user/        # User account components
```

### Component Hierarchy

```
Pages → Templates → Organisms → Molecules → Atoms
```

- **Pages**: Screen-level components (`app/` directory)
- **Templates**: Page layout components (not yet implemented)
- **Organisms**: Complex sections (headers, overlays, boundaries)
- **Molecules**: Simple combinations (cards, indicators)
- **Atoms**: Basic elements (skeletons, buttons, inputs)

## Theme Integration

### Using the Theme System

All components access the theme through the `useAppTheme()` hook:

```tsx
import { useAppTheme } from '@/theme';

const MyComponent = () => {
  const { colors, typography, spacing } = useAppTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      padding: spacing.md,
    },
    title: {
      ...typography.h2,
      marginBottom: spacing.sm,
    },
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Title</Text>
    </View>
  );
};
```

### Theme Structure

The theme provides these standardized values:

- `colors`: Complete color palette with semantic names
- `typography`: Text styles for all hierarchy levels
- `spacing`: 8pt grid spacing values
- `breakpoints`: Responsive layout breakpoints

### Component-Specific Styling

React Native Elements components receive automatic styling through the theme configuration in `apps/client/src/theme/index.ts`. Each RNE component has predefined styles that align with the design specification.

## Accessibility Patterns

### WCAG 2.1 AA Compliance

All components implement these accessibility requirements:

#### Touch Targets
- Minimum 44pt touch target size for interactive elements
- Adequate spacing between interactive elements

#### Color Contrast
- Text meets 4.5:1 contrast ratio against backgrounds
- Interactive elements maintain sufficient contrast in all states

#### Focus Indicators
- Clear visual focus indicators for keyboard navigation
- Focus moves logically through interactive elements

#### Screen Reader Support
- Meaningful `testID` attributes for automated testing
- Proper semantic structure with appropriate heading levels
- Descriptive text for non-text content

### Testing ID Conventions

All components use consistent `testID` naming:

```
{componentName}-{element}-{modifier}

Examples:
- error-card-retry-button
- loading-skeleton-title
- network-indicator-status
- login-form-submit-button
```

### Accessibility Implementation Example

```tsx
// Proper accessibility implementation
<TouchableOpacity
  testID="error-card-retry-button"
  onPress={onRetry}
  accessibilityLabel={t('errors.retry')}
  accessibilityRole="button"
  accessibilityHint={t('errors.retryHint')}
  style={styles.retryButton}
>
  <Text style={styles.retryText}>{t('errors.retry')}</Text>
</TouchableOpacity>
```

## Localization Guidelines

### i18next Integration

All components use the i18next system for Traditional Chinese support:

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <Text>{t('component.title')}</Text>
  );
};
```

### Translation Key Conventions

Structured naming for translation keys:

```
{domain}.{component}.{element}

Examples:
- auth.login.title
- errors.network.message  
- loading.pleaseWait
- common.buttons.retry
```

### Font Support

Platform-specific font handling for Traditional Chinese:

- **iOS**: PingFang TC (system default)
- **Android**: Noto Sans CJK TC (system default)

Typography automatically adapts to system fonts without additional configuration.

### Required Translation Keys

Core translation keys used across components:

```json
{
  "errors": {
    "networkError": "網路連線錯誤",
    "serverError": "伺服器錯誤", 
    "unknownError": "未知錯誤",
    "retry": "重試",
    "goBack": "返回",
    "somethingWentWrong": "發生錯誤"
  },
  "loading": {
    "loading": "載入中...",
    "pleaseWait": "請稍候..."
  },
  "common": {
    "ok": "確定",
    "cancel": "取消",
    "save": "儲存",
    "delete": "刪除"
  }
}
```

## Testing Patterns

### Test Location & Standards

- **Location**: Colocated with components (`.spec.tsx` files)
- **Framework**: Jest + React Native Testing Library
- **Coverage**: Unit behavior, visual rendering, accessibility, localization

### Mocking Strategy

Standard mocks for consistent testing:

```tsx
// Mock React Native Elements
jest.mock('@rneui/themed', () => ({
  Card: 'Card',
  Button: 'Button',
  Text: 'Text',
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn() },
  }),
}));

// Mock theme
jest.mock('@/theme', () => ({
  useAppTheme: () => ({
    colors: { primary: '#007BFF', background: '#FFFFFF' },
    spacing: { md: 16, sm: 8 },
    typography: { h2: { fontSize: 20 } },
  }),
}));
```

### Test Examples

#### Component Rendering Test
```tsx
import { render } from '@testing-library/react-native';
import { ErrorCard } from './ErrorCard';

describe('ErrorCard', () => {
  it('renders error message correctly', () => {
    const { getByTestId } = render(
      <ErrorCard 
        error="Test error" 
        onRetry={jest.fn()} 
        testID="error-card"
      />
    );
    
    expect(getByTestId('error-card')).toBeTruthy();
  });
});
```

#### Accessibility Test
```tsx
it('meets accessibility requirements', () => {
  const { getByTestId } = render(
    <ErrorCard error="Test error" onRetry={jest.fn()} testID="error-card" />
  );
  
  const retryButton = getByTestId('error-card-retry-button');
  expect(retryButton).toBeTruthy();
  expect(retryButton.props.accessibilityRole).toBe('button');
});
```

#### Localization Test
```tsx
it('displays localized text', () => {
  const mockT = jest.fn((key) => {
    const translations = {
      'errors.retry': '重試',
      'errors.networkError': '網路連線錯誤'
    };
    return translations[key] || key;
  });
  
  (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
  
  const { getByText } = render(
    <ErrorCard error="networkError" onRetry={jest.fn()} testID="error-card" />
  );
  
  expect(getByText('重試')).toBeTruthy();
});
```

## Migration Reference

### Gluestack UI to React Native Elements Mapping

| Gluestack UI | React Native Elements | Migration Notes |
|--------------|----------------------|-----------------|
| Box | View (React Native) | Use standard View component |
| Text | Text | Enhanced with theme typography |
| Button | Button | Similar API, enhanced styling |
| Input | Input | Consistent validation patterns |
| Card | Card | Enhanced shadow and border styling |
| Skeleton | Skeleton | Custom LoadingSkeleton component |
| Modal | Overlay | Enhanced backdrop and positioning |
| Badge | Badge | Consistent sizing and colors |
| Avatar | Avatar | Enhanced placeholder styling |
| CheckBox | CheckBox | Improved accessibility support |
| Divider | Divider | Consistent thickness and color |

### Key Migration Principles

1. **Theme Integration**: All styles moved from component-level to theme configuration
2. **Accessibility Enhancement**: Added comprehensive testID and accessibility props
3. **TypeScript Support**: Full type definitions for all component props
4. **Consistent API**: Standardized prop names and patterns across components
5. **Localization Ready**: All text content externalized to translation files

### Breaking Changes

- **Import Paths**: Components now import from `@/components/{atoms,molecules,organisms}/`
- **Prop Names**: Some props renamed for consistency (e.g., `variant` → `type`)
- **Styling**: Direct style props replaced with theme-based styling
- **Icons**: Must use @expo/vector-icons instead of custom icon sets

## Best Practices

### Component Development

1. **Follow Atomic Design**: Place components in appropriate atomic hierarchy
2. **Use Theme System**: Never hardcode colors, spacing, or typography
3. **Implement Accessibility**: Always include testID and accessibility props
4. **Externalize Text**: Use i18n for all user-visible text
5. **Write Tests**: Include unit, accessibility, and localization tests
6. **Document Props**: Use TypeScript interfaces for clear prop definitions

### Performance Considerations

1. **Lazy Loading**: Use React.lazy for large feature components
2. **Memoization**: Implement React.memo for pure components
3. **Optimize Renders**: Minimize unnecessary re-renders with useCallback
4. **Image Optimization**: Use appropriate image formats and sizes
5. **Bundle Splitting**: Separate feature-specific code into chunks

### Security Guidelines

1. **Input Validation**: Validate all user inputs in form components
2. **XSS Prevention**: Sanitize dynamic content before rendering
3. **Secure Storage**: Never store sensitive data in component state
4. **Network Security**: Use HTTPS for all API communications
5. **Authentication**: Implement proper session management

## Conclusion

This component library provides a solid foundation for consistent, accessible, and maintainable React Native development. All components follow established patterns and can be safely extended while maintaining design system compliance.

For questions or contributions, refer to the component source files and their accompanying test files for implementation details and usage examples.