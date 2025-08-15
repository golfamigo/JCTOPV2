# Component Showcase

## Interactive Component Examples

This document provides interactive examples and visual demonstrations of all components in the component library. Use these examples as a reference for implementation and testing.

## Atoms

### LoadingSkeleton

**Visual Examples:**

```tsx
// Text Skeleton
<LoadingSkeleton 
  width="100%" 
  height={20} 
  variant="text" 
  testID="text-skeleton"
/>

// Rectangular Skeleton  
<LoadingSkeleton 
  width={200} 
  height={100} 
  variant="rectangular" 
  testID="rect-skeleton"
/>

// Circular Skeleton (Avatar)
<LoadingSkeleton 
  width={50} 
  height={50} 
  variant="circular" 
  testID="avatar-skeleton"
/>
```

**States:**
- Default: Light grey background with shimmer animation
- Responsive: Adapts width based on container
- Accessibility: Properly labeled for screen readers

## Molecules

### ErrorCard

**Visual Examples:**

```tsx
// Network Error Card
<ErrorCard
  errorType="network"
  message="請檢查您的網路連線並重試"
  onRetry={() => console.log('Retry clicked')}
  onDismiss={() => console.log('Dismiss clicked')}
  testID="network-error"
/>

// Server Error Card
<ErrorCard
  errorType="server"
  title="伺服器暫時無法使用"
  message="我們正在修復此問題，請稍後再試"
  onRetry={() => console.log('Retry clicked')}
  testID="server-error"
/>

// Validation Error Card
<ErrorCard
  errorType="validation"
  title="輸入資料有誤"
  message="請檢查並修正以下欄位的錯誤"
  onDismiss={() => console.log('Dismiss clicked')}
  testID="validation-error"
/>
```

**Visual States:**
- **Icon**: Material Community Icon matching error type
- **Colors**: Danger color (#DC3545) for icons and accents
- **Typography**: H2 for title, Body for message
- **Buttons**: Primary (retry) and outline (dismiss) variants
- **Spacing**: Consistent 8pt grid spacing throughout

### NetworkStatusIndicator

**Visual Examples:**

```tsx
// Top Position (Online)
<NetworkStatusIndicator
  isVisible={true}
  position="top"
  testID="network-top"
/>

// Bottom Position (Offline)  
<NetworkStatusIndicator
  isVisible={true}
  position="bottom"
  testID="network-bottom"
/>
```

**Visual States:**
- **Online**: Green background with "已連線" message
- **Offline**: Red background with "無網路連線" message
- **Position**: Slides in from top or bottom of screen
- **Animation**: Smooth fade in/out transitions

### PasswordStrengthIndicator

**Visual Examples:**

```tsx
// With Label
<PasswordStrengthIndicator
  password="Weak123"
  showLabel={true}
  testID="password-strength"
/>

// Without Label
<PasswordStrengthIndicator
  password="StrongP@ssw0rd!"
  showLabel={false}
  testID="password-strength-simple"
/>
```

**Visual States:**
- **Very Weak**: Red bar (0-20%)
- **Weak**: Orange bar (20-40%)  
- **Fair**: Yellow bar (40-60%)
- **Good**: Light green bar (60-80%)
- **Strong**: Dark green bar (80-100%)

## Organisms

### LoadingOverlay

**Visual Examples:**

```tsx
// Spinner Variant
<LoadingOverlay
  visible={true}
  variant="spinner"
  message="載入中..."
  testID="loading-spinner"
/>

// Skeleton Variant
<LoadingOverlay
  visible={true}
  variant="skeleton"
  message="正在取得資料..."
  testID="loading-skeleton"
/>

// Dots Variant  
<LoadingOverlay
  visible={true}
  variant="dots"
  testID="loading-dots"
/>
```

**Visual States:**
- **Backdrop**: Semi-transparent dark overlay (rgba(0,0,0,0.5))
- **Content**: Centered white container with rounded corners
- **Animation**: Fade in/out with scale animation for content
- **Message**: Optional loading message below animation

### ErrorOverlay

**Visual Examples:**

```tsx
// Full Screen Network Error
<ErrorOverlay
  visible={true}
  error="網路連線錯誤"
  onRetry={() => console.log('Retry')}
  onDismiss={() => console.log('Dismiss')}
  testID="error-overlay"
/>

// Server Error with Custom Message
<ErrorOverlay
  visible={true}
  error={new Error('伺服器回應異常')}
  onRetry={() => console.log('Retry')}
  testID="server-error-overlay"
/>
```

**Visual States:**
- **Backdrop**: Full screen semi-transparent overlay
- **Card**: Centered error card with shadow and border radius
- **Icon**: Large error icon (48px) in danger color
- **Actions**: Retry and dismiss buttons with proper spacing

### ErrorBoundary

**Usage Examples:**

```tsx
// Wrapping App Components
<ErrorBoundary
  fallbackComponent={CustomErrorFallback}
  onError={(error, errorInfo) => {
    console.error('Error caught:', error);
    // Send to error reporting service
  }}
>
  <App />
</ErrorBoundary>

// With Default Fallback
<ErrorBoundary>
  <SomeComponentThatMightError />
</ErrorBoundary>
```

**Visual States:**
- **Normal**: Renders children without interference
- **Error State**: Shows fallback UI with error message
- **Recovery**: Provides retry mechanism to reset error boundary

### NavigationHeader

**Visual Examples:**

```tsx
// Basic Header with Title
<NavigationHeader
  title="活動列表"
  testID="events-header"
/>

// Header with Back Button
<NavigationHeader
  title="活動詳情"
  showBack={true}
  testID="event-detail-header"
/>

// Header with Right Actions
<NavigationHeader
  title="我的帳戶"
  rightActions={[
    <Icon name="settings" onPress={() => {}} />,
    <Icon name="help" onPress={() => {}} />
  ]}
  testID="profile-header"
/>
```

**Visual States:**
- **Background**: Primary color (#007BFF) with shadow
- **Text**: White title text, 18pt semibold
- **Icons**: White icons with proper touch targets
- **Height**: Platform-appropriate header height

## Feature Components

### Authentication Forms

#### LoginForm

**Visual Examples:**

```tsx
<LoginForm
  onSubmit={async (credentials) => {
    console.log('Login:', credentials);
  }}
  loading={false}
  error={null}
/>

// With Error State
<LoginForm
  onSubmit={async (credentials) => {
    throw new Error('驗證失敗');
  }}
  loading={false}
  error="電子信箱或密碼錯誤"
/>

// Loading State
<LoginForm
  onSubmit={async (credentials) => {
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 2000));
  }}
  loading={true}
  error={null}
/>
```

**Visual Components:**
- **Inputs**: Email and password fields with proper validation
- **Button**: Primary action button with loading states
- **Links**: "Forgot password" and "Create account" links
- **Error Display**: Error card for authentication failures

#### RegisterForm

**Visual Examples:**

```tsx
<RegisterForm
  onSubmit={async (userData) => {
    console.log('Register:', userData);
  }}
  loading={false}
  error={null}
/>

// With Validation Errors
<RegisterForm
  onSubmit={async (userData) => {
    throw new Error('此電子信箱已被使用');
  }}
  loading={false}  
  error="註冊失敗"
/>
```

**Visual Components:**
- **Inputs**: Name, email, password, and confirm password
- **Password Strength**: Real-time password strength indicator
- **Validation**: Inline error messages for each field
- **Terms**: Checkbox for terms and conditions agreement

#### ProfilePage

**Visual Examples:**

```tsx
<ProfilePage
  user={{
    name: '陳小明',
    email: 'chen@example.com',
    phone: '0912-345-678',
    provider: 'email',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01')
  }}
  onUpdate={async (userData) => {
    console.log('Update:', userData);
  }}
  loading={false}
/>
```

**Visual Components:**
- **Avatar**: User avatar with fallback initials
- **Form Fields**: Editable user information
- **Account Info**: Read-only authentication details
- **Actions**: Save changes and change password buttons

## Responsive Behavior

### Mobile (<768px)
- **Single Column**: All components stack vertically
- **Touch Targets**: Minimum 44pt for all interactive elements
- **Navigation**: Bottom tab navigation pattern
- **Spacing**: Compact spacing for mobile screens

### Tablet (≥768px)
- **Multi Column**: Forms and content can use multiple columns
- **Larger Touch Targets**: Enhanced interaction areas
- **Navigation**: Adaptive navigation patterns
- **Spacing**: Increased spacing for larger screens

### Desktop (≥1200px)
- **Side Navigation**: Persistent side navigation
- **Hover States**: Mouse-over interactions for buttons and links
- **Keyboard Navigation**: Full keyboard accessibility support
- **Spacing**: Maximum spacing for desktop layouts

## Accessibility Features

### Screen Reader Support
All components include:
- Meaningful `testID` attributes for automated testing
- Proper semantic roles and labels
- Descriptive text for non-text content
- Logical tab order and focus management

### Keyboard Navigation
- **Tab Order**: Logical progression through interactive elements  
- **Focus Indicators**: Clear visual focus states
- **Keyboard Shortcuts**: Standard shortcuts where applicable
- **Escape Actions**: ESC key support for modals and overlays

### Color Contrast
All text meets WCAG 2.1 AA requirements:
- **Normal Text**: 4.5:1 contrast ratio minimum
- **Large Text**: 3:1 contrast ratio minimum
- **Interactive Elements**: Clear visual states for all interactions

## Testing Examples

### Unit Tests
```tsx
describe('ErrorCard', () => {
  it('renders with correct accessibility attributes', () => {
    const { getByTestId } = render(
      <ErrorCard 
        error="Test error" 
        onRetry={jest.fn()} 
        testID="test-error"
      />
    );
    
    const retryButton = getByTestId('test-error-retry-button');
    expect(retryButton).toHaveAccessibilityRole('button');
    expect(retryButton).toBeEnabled();
  });
});
```

### Integration Tests  
```tsx
describe('LoginForm Integration', () => {
  it('handles complete login flow', async () => {
    const mockSubmit = jest.fn();
    const { getByTestId } = render(
      <LoginForm onSubmit={mockSubmit} loading={false} error={null} />
    );
    
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByTestId('login-button'));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

### Accessibility Tests
```tsx
describe('Component Accessibility', () => {
  it('meets accessibility guidelines', async () => {
    const { container } = render(<ErrorCard error="Test" onRetry={jest.fn()} />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Performance Considerations

### Optimization Techniques
- **React.memo**: Pure components are memoized to prevent unnecessary re-renders
- **useCallback**: Event handlers are memoized to maintain reference equality
- **Lazy Loading**: Large feature components are loaded only when needed
- **Image Optimization**: All images use appropriate formats and sizes

### Bundle Splitting
Components are organized to support:
- **Code Splitting**: Feature-specific components in separate chunks
- **Tree Shaking**: Unused components are excluded from builds
- **Dynamic Imports**: Runtime loading of heavy components

## Best Practices Summary

### Development Guidelines
1. **Use Theme System**: Always use theme values instead of hardcoded styles
2. **Implement Accessibility**: Include testID and accessibility props
3. **Externalize Text**: All user-visible text must use i18n
4. **Write Tests**: Include unit, integration, and accessibility tests
5. **Follow Patterns**: Maintain consistency with existing components

### Quality Assurance
1. **Visual Testing**: Verify component rendering across devices
2. **Interaction Testing**: Test all user interactions and states
3. **Accessibility Audit**: Regular accessibility compliance checks
4. **Performance Monitoring**: Track component rendering performance
5. **Cross-Platform Testing**: Verify behavior on iOS and Android

This showcase provides a comprehensive reference for all component implementations, their visual states, and proper usage patterns. Use these examples to maintain consistency and quality across the application.