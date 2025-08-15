# Testing Best Practices - React Native Elements

## Overview
This document outlines testing best practices for the JCTOP V2 application using React Native Elements.

## Test Structure

### 1. File Organization
```
src/
├── components/
│   ├── atoms/
│   │   ├── Button.tsx
│   │   └── Button.spec.tsx
│   ├── molecules/
│   │   ├── FormField.tsx
│   │   └── FormField.spec.tsx
│   └── organisms/
│       ├── EventCard.tsx
│       └── EventCard.spec.tsx
├── services/
│   ├── authService.ts
│   └── authService.spec.ts
└── test-utils/
    ├── test-helpers.tsx
    └── theme-wrapper.tsx
```

### 2. Test File Naming
- Unit tests: `*.spec.ts` or `*.spec.tsx`
- Integration tests: `*.integration.spec.tsx`
- E2E tests: `*.e2e.spec.tsx`

## Testing React Native Elements Components

### 1. Basic Component Test Template

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '@/theme';
import { YourComponent } from './YourComponent';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('YourComponent', () => {
  it('renders correctly', () => {
    const { getByText } = renderWithTheme(
      <YourComponent title="Test" />
    );
    
    expect(getByText('Test')).toBeTruthy();
  });
});
```

### 2. Testing with i18n

```typescript
import { render } from '@/test-utils/test-helpers'; // Uses custom render with providers

describe('LocalizedComponent', () => {
  it('displays Traditional Chinese text', () => {
    const { getByText } = render(<LocalizedComponent />);
    
    expect(getByText('登入')).toBeTruthy();
    expect(queryByText('Login')).toBeNull();
  });
});
```

### 3. Testing User Interactions

```typescript
describe('InteractiveComponent', () => {
  it('handles button press', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <Button onPress={onPress}>Click Me</Button>
    );
    
    fireEvent.press(getByText('Click Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('handles text input', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = renderWithTheme(
      <Input 
        testID="email-input"
        onChangeText={onChangeText}
      />
    );
    
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    expect(onChangeText).toHaveBeenCalledWith('test@example.com');
  });
});
```

## Mocking Strategies

### 1. Mock Modules in jest-setup.ts

```typescript
// jest-setup.ts
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));
```

### 2. Mock Services

```typescript
jest.mock('@/services/authService');

describe('LoginScreen', () => {
  it('handles successful login', async () => {
    const authService = require('@/services/authService');
    authService.login.mockResolvedValue({
      user: { id: '1', email: 'test@example.com' },
      token: 'jwt-token',
    });

    // Test implementation
  });
});
```

### 3. Mock Navigation

```typescript
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));
```

## Testing Async Operations

### 1. API Calls

```typescript
describe('DataFetching', () => {
  it('loads data successfully', async () => {
    const { getByText, findByText } = render(<DataList />);
    
    // Initial loading state
    expect(getByText('載入中...')).toBeTruthy();
    
    // Wait for data
    const item = await findByText('Data Item');
    expect(item).toBeTruthy();
  });

  it('handles errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    
    const { findByText } = render(<DataList />);
    
    const error = await findByText('載入失敗');
    expect(error).toBeTruthy();
  });
});
```

### 2. Timers and Delays

```typescript
describe('TimerComponent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows notification after delay', () => {
    const { getByText, queryByText } = render(<DelayedNotification />);
    
    expect(queryByText('Notification')).toBeNull();
    
    jest.advanceTimersByTime(3000);
    
    expect(getByText('Notification')).toBeTruthy();
  });
});
```

## Performance Testing

### 1. Render Performance

```typescript
describe('Performance', () => {
  it('renders list efficiently', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      title: `Item ${i}`,
    }));

    const start = performance.now();
    const { container } = render(<VirtualizedList items={items} />);
    const end = performance.now();

    expect(end - start).toBeLessThan(100); // Should render in < 100ms
  });
});
```

### 2. Memory Leaks

```typescript
describe('Memory Management', () => {
  it('cleans up subscriptions', () => {
    const { unmount } = render(<SubscriptionComponent />);
    
    const unsubscribe = jest.fn();
    
    unmount();
    
    expect(unsubscribe).toHaveBeenCalled();
  });
});
```

## Accessibility Testing

### 1. Screen Reader Support

```typescript
describe('Accessibility', () => {
  it('has proper accessibility labels', () => {
    const { getByLabelText } = render(<LoginForm />);
    
    expect(getByLabelText('電子郵件輸入框')).toBeTruthy();
    expect(getByLabelText('密碼輸入框')).toBeTruthy();
  });

  it('has proper roles', () => {
    const { getByRole } = render(<SubmitButton />);
    
    expect(getByRole('button')).toBeTruthy();
  });
});
```

### 2. Touch Target Size

```typescript
describe('Touch Targets', () => {
  it('meets minimum touch target size', () => {
    const { getByTestId } = render(<IconButton testID="icon-btn" />);
    
    const button = getByTestId('icon-btn');
    const { width, height } = button.props.style;
    
    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
  });
});
```

## Snapshot Testing

### 1. Component Snapshots

```typescript
describe('Snapshot Tests', () => {
  it('matches snapshot', () => {
    const tree = render(
      <EventCard 
        title="Test Event"
        date="2024-12-25"
        location="Taipei"
      />
    ).toJSON();
    
    expect(tree).toMatchSnapshot();
  });
});
```

## Coverage Requirements

### 1. Coverage Targets
- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

### 2. Critical Path Coverage
These components require 100% coverage:
- Payment processing
- Authentication
- Registration flow
- Data persistence

### 3. Running Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html

# Check coverage thresholds
npm test -- --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
```

## CI/CD Integration

### 1. Pre-commit Hooks

```json
// .husky/pre-commit
#!/bin/sh
npm run lint
npm run type-check
npm test -- --bail --findRelatedTests
```

### 2. GitHub Actions

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

## Common Pitfalls to Avoid

1. **Not wrapping with ThemeProvider**: Always wrap RNE components with ThemeProvider
2. **Forgetting to mock async storage**: Causes tests to fail in CI
3. **Not cleaning up timers**: Use `jest.clearAllTimers()` in afterEach
4. **Testing implementation details**: Focus on user behavior, not internals
5. **Incomplete i18n mocking**: Ensure all translation keys are mocked

## Debugging Failed Tests

### 1. Debug Output

```typescript
import { debug } from '@testing-library/react-native';

it('debug component tree', () => {
  const { container } = render(<Component />);
  debug(container); // Prints component tree
});
```

### 2. Wait for Async Updates

```typescript
import { waitFor } from '@testing-library/react-native';

it('waits for async update', async () => {
  const { getByText } = render(<AsyncComponent />);
  
  await waitFor(() => {
    expect(getByText('Loaded')).toBeTruthy();
  }, { timeout: 5000 });
});
```

## Test Maintenance

### 1. Regular Updates
- Update snapshots when UI changes: `npm test -- -u`
- Review and update mocks quarterly
- Keep test dependencies up to date

### 2. Test Review Checklist
- [ ] Tests are deterministic (no random failures)
- [ ] Tests are isolated (no shared state)
- [ ] Tests are fast (< 5 seconds per test)
- [ ] Tests have clear descriptions
- [ ] Tests cover happy path and edge cases

---

**Document Version**: 1.0
**Last Updated**: 2025-08-14
**Next Review**: 2025-09-14