# Spacing Guidelines - 8pt Grid System

## Overview
Our application follows an 8-point grid system for consistent spacing throughout the UI. This ensures visual harmony and predictable layouts across all screens.

## Base Unit
The base unit is **8 points**, with all spacing values being multiples of this unit.

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Minimal spacing, icon gaps |
| `sm` | 8px | Tight spacing, small gaps |
| `md` | 16px | Default spacing, standard padding |
| `lg` | 24px | Section spacing, larger gaps |
| `xl` | 32px | Major sections, prominent spacing |
| `xxl` | 40px | Page sections, hero spacing |
| `xxxl` | 48px | Maximum spacing, large separations |

## Usage with useSpacing Hook

### Basic Usage
```typescript
import { useSpacing } from '@/hooks/useSpacing';

const MyComponent = () => {
  const spacing = useSpacing();
  
  return (
    <View style={{
      padding: spacing.md,        // 16px
      marginBottom: spacing.lg,    // 24px
      gap: spacing.sm             // 8px
    }}>
      {/* content */}
    </View>
  );
};
```

### Helper Functions
```typescript
const spacing = useSpacing();

// Padding helpers
spacing.padding('md');                    // padding: 16
spacing.padding(undefined, 'sm', 'lg');   // paddingVertical: 8, paddingHorizontal: 24

// Margin helpers  
spacing.margin('lg');                     // margin: 24
spacing.margin(undefined, 'md', 'xl');    // marginVertical: 16, marginHorizontal: 32

// Gap helper (for flexbox)
spacing.gap('sm');                        // gap: 8
```

### Common Patterns
```typescript
const spacing = useSpacing();

// Pre-defined patterns
const styles = {
  container: spacing.patterns.container,   // Standard container padding
  card: spacing.patterns.card,            // Card component padding
  listItem: spacing.patterns.listItem,    // List item padding
  section: spacing.patterns.section,      // Section bottom margin
  formField: spacing.patterns.formField,  // Form field spacing
};
```

## Component Spacing Rules

### Containers
- Use `md` (16px) for standard container padding
- Use `lg` (24px) for prominent sections
- Mobile screens may use `sm` (8px) for edge padding

### Cards
- Internal padding: `md` (16px)
- Gap between cards: `sm` (8px) to `md` (16px)

### Lists
- List item padding: `sm` (8px) vertical, `md` (16px) horizontal
- Separator spacing: Use built-in dividers

### Forms
- Field spacing: `md` (16px) between form fields
- Label to input: `xs` (4px) to `sm` (8px)
- Section breaks: `lg` (24px) to `xl` (32px)

### Buttons
- Internal padding: `sm` (8px) to `md` (16px)
- Button group gaps: `sm` (8px)
- Call-to-action spacing: `lg` (24px) margin

### Text
- Paragraph spacing: `md` (16px)
- Heading to content: `sm` (8px) to `md` (16px)
- Line height: Use typography settings

## Platform Considerations

### iOS
- Respect safe areas
- Consider notch and home indicator spacing
- Use platform-specific padding where needed

### Android
- Follow Material Design spacing when appropriate
- Consider status bar and navigation bar

### Web
- Responsive spacing for different breakpoints
- Consider mouse vs touch targets

## Do's and Don'ts

### Do's ✅
- Use spacing tokens consistently
- Apply the useSpacing hook for all spacing
- Follow the 8pt grid system
- Use patterns for common layouts
- Test spacing on different screen sizes

### Don'ts ❌
- Don't use arbitrary pixel values
- Don't mix spacing systems
- Don't use inline style numbers for spacing
- Don't ignore platform guidelines
- Don't create custom spacing values

## Migration Guide

### Before (Hardcoded values)
```typescript
// ❌ Bad
<View style={{ padding: 12, marginBottom: 20 }}>
```

### After (Using spacing system)
```typescript
// ✅ Good
const spacing = useSpacing();
<View style={{ 
  padding: spacing.md,
  marginBottom: spacing.lg 
}}>
```

## Responsive Spacing

For responsive layouts, adjust spacing based on screen size:

```typescript
const spacing = useSpacing();

// Define responsive spacing
const containerPadding = spacing.responsive('sm', 'md', 'lg');

// Use based on screen size
const styles = {
  container: {
    padding: isSmallScreen ? containerPadding.small :
             isMediumScreen ? containerPadding.medium :
             containerPadding.large
  }
};
```

## Accessibility

- Ensure touch targets have minimum 44x44pt (iOS) or 48x48dp (Android)
- Add appropriate spacing around interactive elements
- Consider spacing for users with motor impairments

## Tools and Resources

- Use the useSpacing hook for all spacing needs
- Refer to theme/index.ts for spacing values
- Check SharedComponents for consistent implementations
- Review existing screens for examples