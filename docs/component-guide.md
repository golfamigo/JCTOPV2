# Component Guide

## Overview
This guide documents the standardized component library and usage patterns for the JCTOP V2 application. All components follow React Native Elements (RNE) design system with custom theming.

## Shared Components

### SharedButton

A standardized button component with consistent theming and variants.

#### Usage
```typescript
import { SharedButton } from '@/components/shared';

<SharedButton 
  title="Click Me"
  variant="primary"
  size="medium"
  onPress={handlePress}
  loading={isLoading}
  fullWidth
/>
```

#### Props
- `variant`: 'primary' | 'secondary' | 'outline' | 'text' | 'danger'
- `size`: 'small' | 'medium' | 'large'
- `fullWidth`: boolean - Makes button full width
- `loading`: boolean - Shows loading spinner
- All standard RNE Button props

### SharedCard

Consistent card component for content containers.

#### Usage
```typescript
import { SharedCard } from '@/components/shared';

<SharedCard 
  variant="elevated"
  padding="medium"
  fullWidth
>
  <Text>Card content</Text>
</SharedCard>
```

#### Props
- `variant`: 'elevated' | 'outlined' | 'filled'
- `padding`: 'none' | 'small' | 'medium' | 'large'
- `fullWidth`: boolean
- All standard RNE Card props

### SharedModal

Standardized modal/overlay component.

#### Usage
```typescript
import { SharedModal } from '@/components/shared';

<SharedModal
  isVisible={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="medium"
  footer={
    <>
      <SharedButton title="Cancel" variant="outline" onPress={handleCancel} />
      <SharedButton title="Confirm" onPress={handleConfirm} />
    </>
  }
>
  <Text>Modal content</Text>
</SharedModal>
```

#### Props
- `title`: string - Modal header title
- `showCloseButton`: boolean - Show X close button
- `size`: 'small' | 'medium' | 'large' | 'fullscreen'
- `footer`: ReactNode - Footer buttons/content
- `scrollable`: boolean - Enable scrolling for long content

### SharedList

Consistent list component with built-in features.

#### Usage
```typescript
import { SharedList, SharedListItemData } from '@/components/shared';

const items: SharedListItemData[] = [
  {
    id: '1',
    title: 'Item 1',
    subtitle: 'Description',
    leftIcon: 'folder',
    onPress: () => console.log('Pressed')
  }
];

<SharedList
  items={items}
  loading={isLoading}
  emptyMessage="No items found"
  variant="default"
/>
```

#### Props
- `items`: Array of list items
- `loading`: boolean - Show loading state
- `emptyMessage`: string - Message when list is empty
- `variant`: 'default' | 'compact' | 'expanded'
- `showDivider`: boolean - Show item separators

### SharedForm Components

#### SharedInput
```typescript
import { SharedInput } from '@/components/shared/SharedForm';

<SharedInput
  label="Email"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
  leftIconName="email"
  variant="outlined"
  error={emailError}
/>
```

#### SharedSelect
```typescript
import { SharedSelect } from '@/components/shared/SharedForm';

<SharedSelect
  label="Country"
  options={countryOptions}
  value={selectedCountry}
  onChange={setSelectedCountry}
  searchable
/>
```

#### SharedCheckbox
```typescript
import { SharedCheckbox, SharedCheckboxGroup } from '@/components/shared/SharedForm';

// Single checkbox
<SharedCheckbox
  title="I agree to terms"
  checked={agreed}
  onPress={() => setAgreed(!agreed)}
/>

// Checkbox group
<SharedCheckboxGroup
  label="Select options"
  options={checkboxOptions}
  values={selectedValues}
  onChange={setSelectedValues}
/>
```

## Theme Usage

### Colors
Always use theme colors instead of hardcoded values:

```typescript
const { colors } = useAppTheme();

// Good ✅
style={{ color: colors.primary }}

// Bad ❌
style={{ color: '#007BFF' }}
```

### Spacing
Use the spacing system for consistent layouts:

```typescript
const spacing = useSpacing();

// Good ✅
style={{ padding: spacing.md, marginBottom: spacing.lg }}

// Bad ❌
style={{ padding: 16, marginBottom: 24 }}
```

### Typography
Use theme typography for text styles:

```typescript
const { typography } = useAppTheme();

// Good ✅
<Text style={typography.h2}>Heading</Text>

// Bad ❌
<Text style={{ fontSize: 20, fontWeight: 'bold' }}>Heading</Text>
```

## Migration Guide

### From Chakra UI to RNE

#### Buttons
```typescript
// Before (Chakra)
<Button colorScheme="blue" size="md">Click</Button>

// After (RNE/Shared)
<SharedButton variant="primary" size="medium" title="Click" />
```

#### Icons
```typescript
// Before (Chakra)
import { ChevronLeftIcon } from '@chakra-ui/icons';
<ChevronLeftIcon />

// After (Expo)
import { MaterialIcons } from '@expo/vector-icons';
<MaterialIcons name="chevron-left" size={24} color={colors.text} />
```

#### Cards
```typescript
// Before (Chakra)
<Box p={4} borderWidth={1} borderRadius="md">Content</Box>

// After (Shared)
<SharedCard padding="medium" variant="outlined">Content</SharedCard>
```

## Best Practices

### 1. Component Composition
- Use shared components as building blocks
- Compose complex UI from simple components
- Keep components focused and single-purpose

### 2. Theming
- Always use theme values (colors, spacing, typography)
- Never hardcode colors or spacing values
- Use useAppTheme and useSpacing hooks

### 3. Accessibility
- Always provide testID props for testing
- Include proper labels for form inputs
- Ensure touch targets meet minimum size requirements

### 4. Performance
- Use React.memo for expensive components
- Implement proper key props in lists
- Avoid inline styles in render methods

### 5. Testing
- Use TestThemeProvider wrapper in tests
- Test all component variants
- Include accessibility tests

## Component Patterns

### Form Pattern
```typescript
const MyForm = () => {
  const spacing = useSpacing();
  
  return (
    <View style={spacing.patterns.container}>
      <SharedInput
        label="Name"
        value={name}
        onChangeText={setName}
        error={errors.name}
      />
      
      <View style={{ marginTop: spacing.md }}>
        <SharedSelect
          label="Role"
          options={roleOptions}
          value={role}
          onChange={setRole}
        />
      </View>
      
      <SharedButton
        title="Submit"
        onPress={handleSubmit}
        fullWidth
        style={{ marginTop: spacing.lg }}
      />
    </View>
  );
};
```

### List with Actions Pattern
```typescript
const MyList = () => {
  const items = data.map(item => ({
    id: item.id,
    title: item.name,
    subtitle: item.description,
    rightIcon: 'chevron-right',
    onPress: () => navigateToDetail(item.id)
  }));
  
  return (
    <SharedList
      items={items}
      loading={isLoading}
      emptyMessage="No items found"
    />
  );
};
```

### Modal Form Pattern
```typescript
const MyModalForm = () => {
  return (
    <SharedModal
      isVisible={isOpen}
      onClose={handleClose}
      title="Edit Item"
      footer={
        <>
          <SharedButton 
            title="Cancel" 
            variant="outline" 
            onPress={handleClose} 
          />
          <SharedButton 
            title="Save" 
            onPress={handleSave}
            loading={isSaving}
          />
        </>
      }
    >
      <SharedInput
        label="Item Name"
        value={itemName}
        onChangeText={setItemName}
      />
    </SharedModal>
  );
};
```

## Anti-Patterns to Avoid

### ❌ Don't use inline styles with hardcoded values
```typescript
// Bad
<View style={{ padding: 16, marginBottom: 24 }}>
```

### ❌ Don't mix UI libraries
```typescript
// Bad
import { Button } from '@chakra-ui/react';
import { Card } from '@rneui/themed';
```

### ❌ Don't create one-off component variants
```typescript
// Bad - creating custom button instead of using SharedButton
const MyCustomButton = () => <TouchableOpacity style={customStyles}>...
```

### ❌ Don't ignore TypeScript types
```typescript
// Bad - using 'any' type
const handlePress = (data: any) => ...
```

## Resources

- [React Native Elements Documentation](https://reactnativeelements.com/)
- [Expo Vector Icons Directory](https://icons.expo.fyi/)
- [8pt Grid System Guide](./spacing-guidelines.md)
- [Theme Configuration](../apps/client/src/theme/index.ts)

## Support

For questions or issues with components:
1. Check this guide first
2. Review existing component implementations
3. Consult with the development team
4. Create an issue if you find a bug