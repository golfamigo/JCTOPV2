# React Native Elements Style Guide

## Overview

This style guide defines the design patterns, theme configuration, and best practices for using React Native Elements in the JCTOPV2 project. All UI components should follow these guidelines to ensure consistency across the application.

## Theme Configuration

### Theme Setup

The theme is configured in `apps/client/src/theme/index.ts`:

```typescript
import { createTheme } from '@rneui/themed';

export const theme = createTheme({
  lightColors: {
    primary: '#007BFF',
    secondary: '#6C757D',
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    black: '#212529',
    white: '#FFFFFF',
    grey0: '#F8F9FA',
    grey1: '#E9ECEF',
    grey2: '#DEE2E6',
    grey3: '#CED4DA',
    grey4: '#ADB5BD',
    grey5: '#6C757D',
  },
  darkColors: {
    primary: '#0A84FF',
    secondary: '#8E8E93',
    // ... dark mode colors
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  mode: 'light',
});
```

### Using the Theme

```tsx
import { useTheme } from '@rneui/themed';

const MyComponent = () => {
  const { theme } = useTheme();
  
  return (
    <View style={{ 
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.md,
    }}>
      <Text style={{ color: theme.colors.white }}>
        Themed Text
      </Text>
    </View>
  );
};
```

## Color Palette

### Primary Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary | `#007BFF` | Primary actions, links, focus states |
| Secondary | `#6C757D` | Secondary actions, muted elements |
| Success | `#28A745` | Success states, confirmations |
| Warning | `#FFC107` | Warning messages, caution states |
| Error | `#DC3545` | Error states, destructive actions |

### Neutral Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Black | `#212529` | Primary text, headings |
| White | `#FFFFFF` | Backgrounds, reversed text |
| Grey 0 | `#F8F9FA` | Light backgrounds, cards |
| Grey 1 | `#E9ECEF` | Borders, dividers |
| Grey 2 | `#DEE2E6` | Disabled backgrounds |
| Grey 3 | `#CED4DA` | Disabled text |
| Grey 4 | `#ADB5BD` | Placeholder text |
| Grey 5 | `#6C757D` | Secondary text |

### Usage Examples

```tsx
// Primary button
<Button
  title="Submit"
  buttonStyle={{ backgroundColor: theme.colors.primary }}
/>

// Success message
<Text style={{ color: theme.colors.success }}>
  操作成功！
</Text>

// Error state
<Input
  errorMessage="此欄位為必填"
  errorStyle={{ color: theme.colors.error }}
/>
```

## Typography Guidelines

### Font System

```typescript
const typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  
  // Special text
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
};
```

### Typography Usage

```tsx
// Headings
<Text h1>大標題</Text>
<Text h2>次標題</Text>
<Text h3>小標題</Text>
<Text h4>區塊標題</Text>

// Body text
<Text>這是一般內文文字</Text>
<Text style={{ fontSize: 14 }}>這是較小的文字</Text>

// Special styles
<Text style={{ fontWeight: 'bold' }}>粗體文字</Text>
<Text style={{ fontStyle: 'italic' }}>斜體文字</Text>
<Text style={{ textDecorationLine: 'underline' }}>底線文字</Text>
```

### Platform-Specific Fonts

- **iOS**: System font (蘋方-繁 PingFang TC)
- **Android**: System font (思源黑體 Noto Sans CJK TC)
- **Web**: System font stack with fallbacks

## Spacing System (8pt Grid)

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight spacing, inline elements |
| `sm` | 8px | Small gaps, compact layouts |
| `md` | 16px | Default spacing, standard gaps |
| `lg` | 24px | Section spacing, group separation |
| `xl` | 32px | Large sections, major divisions |
| `xxl` | 40px | Page margins, hero sections |

### Spacing Patterns

```tsx
// Component padding
<Card containerStyle={{ padding: theme.spacing.md }}>
  {/* Content */}
</Card>

// Vertical spacing
<View style={{ marginBottom: theme.spacing.lg }}>
  {/* Content */}
</View>

// Horizontal spacing
<View style={{ 
  flexDirection: 'row',
  gap: theme.spacing.sm,
}}>
  <Button title="Cancel" />
  <Button title="Confirm" />
</View>

// Section spacing
<View style={{ paddingVertical: theme.spacing.xl }}>
  {/* Section content */}
</View>
```

### Layout Guidelines

1. **Margins**: Use consistent margins (16px default)
2. **Padding**: Internal spacing should be 8px minimum
3. **Gaps**: Use 8px or 16px between related elements
4. **Sections**: 24px or 32px between major sections

## Component Usage Patterns

### Buttons

```tsx
// Primary button
<Button
  title="確認"
  buttonStyle={{
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
  }}
  titleStyle={{
    fontSize: 16,
    fontWeight: '600',
  }}
/>

// Secondary button
<Button
  title="取消"
  type="outline"
  buttonStyle={{
    borderColor: theme.colors.grey3,
    borderRadius: 8,
  }}
  titleStyle={{
    color: theme.colors.grey5,
  }}
/>

// Text button
<Button
  title="了解更多"
  type="clear"
  titleStyle={{
    color: theme.colors.primary,
  }}
/>

// Icon button
<Button
  icon={
    <MaterialIcons
      name="add"
      size={24}
      color="white"
    />
  }
  buttonStyle={{
    width: 48,
    height: 48,
    borderRadius: 24,
  }}
/>
```

### Input Fields

```tsx
// Standard input
<Input
  placeholder="請輸入姓名"
  leftIcon={
    <Ionicons
      name="person"
      size={20}
      color={theme.colors.grey4}
    />
  }
  inputContainerStyle={{
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey3,
  }}
/>

// Outlined input
<Input
  placeholder="請輸入電子郵件"
  containerStyle={{ paddingHorizontal: 0 }}
  inputContainerStyle={{
    borderWidth: 1,
    borderColor: theme.colors.grey3,
    borderRadius: 8,
    paddingHorizontal: 12,
  }}
/>

// Input with validation
<Input
  placeholder="請輸入密碼"
  secureTextEntry
  errorMessage={error ? "密碼至少需要8個字元" : ""}
  errorStyle={{ color: theme.colors.error }}
/>
```

### Cards

```tsx
// Basic card
<Card containerStyle={{
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
}}>
  <Card.Title>活動名稱</Card.Title>
  <Card.Divider />
  <Text>活動描述...</Text>
</Card>

// Image card
<Card containerStyle={{ borderRadius: 12, padding: 0 }}>
  <Card.Image
    source={{ uri: imageUrl }}
    style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
  />
  <View style={{ padding: theme.spacing.md }}>
    <Text h4>標題</Text>
    <Text>內容描述</Text>
  </View>
</Card>
```

### Lists

```tsx
// Simple list
<FlatList
  data={items}
  keyExtractor={item => item.id}
  renderItem={({ item }) => (
    <ListItem bottomDivider>
      <ListItem.Content>
        <ListItem.Title>{item.title}</ListItem.Title>
        <ListItem.Subtitle>{item.subtitle}</ListItem.Subtitle>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  )}
/>

// Custom list item
<ListItem
  containerStyle={{
    backgroundColor: theme.colors.grey0,
    borderRadius: 8,
    marginVertical: 4,
  }}
>
  <Avatar source={{ uri: item.avatar }} />
  <ListItem.Content>
    <ListItem.Title style={{ fontWeight: '600' }}>
      {item.name}
    </ListItem.Title>
    <ListItem.Subtitle style={{ color: theme.colors.grey5 }}>
      {item.description}
    </ListItem.Subtitle>
  </ListItem.Content>
</ListItem>
```

## Responsive Design Patterns

### Breakpoints

```typescript
const breakpoints = {
  mobile: 0,      // < 768px
  tablet: 768,    // >= 768px
  desktop: 1200,  // >= 1200px
};
```

### Responsive Utilities

```tsx
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const isTablet = width >= 768;
const isDesktop = width >= 1200;

// Responsive styles
const styles = StyleSheet.create({
  container: {
    padding: isTablet ? 24 : 16,
    flexDirection: isDesktop ? 'row' : 'column',
  },
  card: {
    width: isTablet ? '48%' : '100%',
    marginBottom: 16,
  },
});
```

### Responsive Grid

```tsx
// Two-column grid on tablets
<View style={{
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
}}>
  {items.map(item => (
    <View
      key={item.id}
      style={{
        width: isTablet ? '48%' : '100%',
        marginBottom: theme.spacing.md,
      }}
    >
      <Card>{/* Content */}</Card>
    </View>
  ))}
</View>
```

## Accessibility Implementation

### Touch Targets

Minimum touch target size: **44x44 points**

```tsx
// Accessible button
<TouchableOpacity
  style={{
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  }}
  accessible={true}
  accessibilityLabel="新增項目"
  accessibilityRole="button"
>
  <MaterialIcons name="add" size={24} />
</TouchableOpacity>
```

### Labels and Hints

```tsx
// Input with accessibility
<Input
  placeholder="電子郵件"
  accessible={true}
  accessibilityLabel="電子郵件輸入欄位"
  accessibilityHint="請輸入您的電子郵件地址"
/>

// Image with description
<Image
  source={{ uri: eventImage }}
  accessible={true}
  accessibilityLabel="活動海報圖片"
/>
```

### Screen Reader Support

```tsx
// Announce changes
import { AccessibilityInfo } from 'react-native';

// Announce status changes
AccessibilityInfo.announceForAccessibility('表單已成功提交');

// Group related elements
<View
  accessible={true}
  accessibilityRole="group"
  accessibilityLabel="票券資訊"
>
  <Text>票種：一般票</Text>
  <Text>價格：NT$ 500</Text>
  <Text>剩餘：25 張</Text>
</View>
```

### Color Contrast

Ensure WCAG AA compliance:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Interactive elements: 3:1 contrast ratio

## Animation Patterns

### Standard Animations

```tsx
import { Animated } from 'react-native';

// Fade in animation
const fadeAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }).start();
}, []);

// Scale animation for buttons
const scaleValue = useRef(new Animated.Value(1)).current;

const handlePressIn = () => {
  Animated.spring(scaleValue, {
    toValue: 0.95,
    useNativeDriver: true,
  }).start();
};

const handlePressOut = () => {
  Animated.spring(scaleValue, {
    toValue: 1,
    useNativeDriver: true,
  }).start();
};
```

### Loading States

```tsx
// Skeleton loader
<Card>
  <Skeleton animation="pulse" width="100%" height={200} />
  <View style={{ padding: theme.spacing.md }}>
    <Skeleton animation="pulse" width="80%" height={20} />
    <Skeleton animation="pulse" width="60%" height={16} style={{ marginTop: 8 }} />
  </View>
</Card>

// Activity indicator
<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  <ActivityIndicator size="large" color={theme.colors.primary} />
  <Text style={{ marginTop: theme.spacing.md }}>載入中...</Text>
</View>
```

## Best Practices

### Do's ✅

1. **Use theme values** - Always reference theme for colors and spacing
2. **Maintain consistency** - Follow established patterns
3. **Test on devices** - Verify on iOS and Android
4. **Consider accessibility** - Add labels and hints
5. **Optimize performance** - Use React.memo when needed
6. **Follow 8pt grid** - Align to spacing system
7. **Use semantic colors** - primary for main actions, error for warnings

### Don'ts ❌

1. **Hardcode colors** - Don't use hex values directly
2. **Ignore platform differences** - Test on both platforms
3. **Skip accessibility** - Always add labels
4. **Use random spacing** - Stick to the scale
5. **Mix UI libraries** - Use only React Native Elements
6. **Ignore theme mode** - Support dark mode ready
7. **Create one-off styles** - Reuse existing patterns

## Component Composition

### Creating Reusable Components

```tsx
// atoms/PrimaryButton.tsx
interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
}) => {
  const { theme } = useTheme();
  
  return (
    <Button
      title={title}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      buttonStyle={{
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        paddingVertical: 12,
      }}
      titleStyle={{
        fontSize: 16,
        fontWeight: '600',
      }}
      disabledStyle={{
        backgroundColor: theme.colors.grey3,
      }}
    />
  );
};
```

### Atomic Design Hierarchy

```
Atoms → Molecules → Organisms → Templates → Pages

Examples:
- Atom: Button, Input, Text
- Molecule: FormField, SearchBar, Card
- Organism: Header, EventCard, PaymentForm
- Template: EventLayout, AuthLayout
- Page: EventDetailsScreen, LoginScreen
```

## Testing Styled Components

```tsx
// Test theme integration
import { renderWithTheme } from '@test-utils';

test('button uses primary color', () => {
  const { getByRole } = renderWithTheme(
    <PrimaryButton title="Test" onPress={jest.fn()} />
  );
  
  const button = getByRole('button');
  expect(button).toHaveStyle({
    backgroundColor: '#007BFF',
  });
});
```

---

*Last Updated: 2025-08-14*
*Version: 1.0.0*