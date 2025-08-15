# Component Mapping: Gluestack UI → React Native Elements

## Overview

This document provides a comprehensive mapping between Gluestack UI components and their React Native Elements equivalents, including code examples and migration notes.

## Component Mapping Table

| Gluestack UI Component | React Native Elements | Notes |
|------------------------|----------------------|-------|
| `Button` | `Button` | Different prop structure |
| `Input` | `Input` | Simplified API |
| `Text` | `Text` | Similar usage |
| `Heading` | `Text` with `h1-h4` prop | Use heading props |
| `Box` | `View` | Native replacement |
| `VStack` | `View` with flex | Use flexDirection: 'column' |
| `HStack` | `View` with flex | Use flexDirection: 'row' |
| `Modal` | `Overlay` | Different structure |
| `Select` | `Dropdown` (custom) | Custom implementation needed |
| `Checkbox` | `CheckBox` | Similar API |
| `Radio` | `ButtonGroup` | Use for radio groups |
| `Switch` | `Switch` | Native component |
| `Badge` | `Badge` | Direct replacement |
| `Avatar` | `Avatar` | Similar API |
| `Card` | `Card` | Direct replacement |
| `Divider` | `Divider` | Direct replacement |
| `Icon` | `Icon` | Use @expo/vector-icons |
| `Spinner` | `ActivityIndicator` | Native component |
| `Toast` | `Toast` (custom) | Custom implementation |
| `Alert` | `View` + `Text` | Custom styling |
| `Progress` | `LinearProgress` | Direct replacement |
| `Slider` | `Slider` | Direct replacement |
| `FAB` | `SpeedDial` | Enhanced functionality |

## Detailed Component Migration

### 1. Button Component

#### Gluestack UI (Before)
```tsx
import { Button, ButtonText, ButtonIcon } from '@gluestack-ui/themed';

<Button
  variant="solid"
  action="primary"
  size="md"
  isDisabled={false}
  onPress={handlePress}
>
  <ButtonIcon as={AddIcon} />
  <ButtonText>Add Item</ButtonText>
</Button>
```

#### React Native Elements (After)
```tsx
import { Button } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';

<Button
  title="Add Item"
  icon={
    <MaterialIcons
      name="add"
      size={20}
      color="white"
    />
  }
  buttonStyle={{
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  }}
  disabled={false}
  onPress={handlePress}
/>
```

#### Migration Notes
- `variant` and `action` props replaced with `buttonStyle`
- `ButtonText` content moves to `title` prop
- `ButtonIcon` replaced with `icon` prop
- Size controlled through buttonStyle

---

### 2. Input Component

#### Gluestack UI (Before)
```tsx
import { Input, InputField, InputIcon } from '@gluestack-ui/themed';

<Input variant="outline" size="md" isDisabled={false}>
  <InputIcon as={SearchIcon} />
  <InputField
    placeholder="Search..."
    value={value}
    onChangeText={onChange}
  />
</Input>
```

#### React Native Elements (After)
```tsx
import { Input } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';

<Input
  placeholder="Search..."
  value={value}
  onChangeText={onChange}
  leftIcon={
    <Ionicons
      name="search"
      size={20}
      color={theme.colors.grey3}
    />
  }
  containerStyle={{
    paddingHorizontal: 0,
  }}
  inputContainerStyle={{
    borderWidth: 1,
    borderColor: theme.colors.grey4,
    borderRadius: 8,
    paddingHorizontal: 10,
  }}
  disabled={false}
/>
```

#### Migration Notes
- Single `Input` component instead of nested structure
- Icons specified via `leftIcon` or `rightIcon` props
- Styling through `containerStyle` and `inputContainerStyle`

---

### 3. Modal/Overlay Component

#### Gluestack UI (Before)
```tsx
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@gluestack-ui/themed';

<Modal isOpen={isOpen} onClose={onClose}>
  <ModalBackdrop />
  <ModalContent>
    <ModalHeader>
      <Heading>Modal Title</Heading>
      <ModalCloseButton />
    </ModalHeader>
    <ModalBody>
      <Text>Modal content goes here</Text>
    </ModalBody>
    <ModalFooter>
      <Button onPress={onClose}>
        <ButtonText>Close</ButtonText>
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

#### React Native Elements (After)
```tsx
import { Overlay, Text, Button } from '@rneui/themed';
import { View } from 'react-native';

<Overlay
  isVisible={isOpen}
  onBackdropPress={onClose}
  overlayStyle={{
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
  }}
>
  <View>
    <Text h4 style={{ marginBottom: 15 }}>Modal Title</Text>
    <Text style={{ marginBottom: 20 }}>Modal content goes here</Text>
    <Button
      title="Close"
      onPress={onClose}
      buttonStyle={{ borderRadius: 8 }}
    />
  </View>
</Overlay>
```

#### Migration Notes
- `Modal` replaced with `Overlay`
- Manual structure for header, body, footer
- `isOpen` becomes `isVisible`
- Backdrop press handled via `onBackdropPress`

---

### 4. Card Component

#### Gluestack UI (Before)
```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@gluestack-ui/themed';

<Card size="md" variant="elevated">
  <CardHeader>
    <Heading>Card Title</Heading>
  </CardHeader>
  <CardBody>
    <Text>Card content</Text>
  </CardBody>
  <CardFooter>
    <Button>
      <ButtonText>Action</ButtonText>
    </Button>
  </CardFooter>
</Card>
```

#### React Native Elements (After)
```tsx
import { Card, Text, Button } from '@rneui/themed';

<Card containerStyle={{ borderRadius: 12 }}>
  <Card.Title>Card Title</Card.Title>
  <Card.Divider />
  <Text>Card content</Text>
  <Button
    title="Action"
    buttonStyle={{ marginTop: 15 }}
  />
</Card>
```

#### Migration Notes
- Simpler Card API with built-in sections
- `Card.Title` for headers
- `Card.Divider` for separation
- Content goes directly in Card body

---

### 5. Form Components

#### Checkbox - Gluestack UI (Before)
```tsx
import { Checkbox, CheckboxIndicator, CheckboxIcon, CheckboxLabel } from '@gluestack-ui/themed';

<Checkbox value="option1" isChecked={checked} onChange={setChecked}>
  <CheckboxIndicator>
    <CheckboxIcon as={CheckIcon} />
  </CheckboxIndicator>
  <CheckboxLabel>Option 1</CheckboxLabel>
</Checkbox>
```

#### Checkbox - React Native Elements (After)
```tsx
import { CheckBox } from '@rneui/themed';

<CheckBox
  title="Option 1"
  checked={checked}
  onPress={() => setChecked(!checked)}
  containerStyle={{ backgroundColor: 'transparent', borderWidth: 0 }}
/>
```

---

### 6. Layout Components

#### Stack Components - Gluestack UI (Before)
```tsx
import { VStack, HStack } from '@gluestack-ui/themed';

<VStack space="md" reversed={false}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</VStack>

<HStack space="sm" reversed={false}>
  <Text>Left</Text>
  <Text>Right</Text>
</HStack>
```

#### Stack Components - React Native (After)
```tsx
import { View } from 'react-native';
import { Text } from '@rneui/themed';

// VStack equivalent
<View style={{ flexDirection: 'column', gap: 12 }}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</View>

// HStack equivalent
<View style={{ flexDirection: 'row', gap: 8 }}>
  <Text>Left</Text>
  <Text>Right</Text>
</View>
```

---

### 7. Icon Migration

#### Gluestack Icons (Before)
```tsx
import { AddIcon, SearchIcon, CloseIcon } from '@gluestack-ui/themed';

<Icon as={AddIcon} size="md" color="$primary" />
```

#### Expo Vector Icons (After)
```tsx
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';

<MaterialIcons name="add" size={24} color={theme.colors.primary} />
<Ionicons name="search" size={24} color={theme.colors.primary} />
<AntDesign name="close" size={24} color={theme.colors.primary} />
```

#### Icon Mapping Reference
| Gluestack Icon | Vector Icon Family | Icon Name |
|----------------|-------------------|-----------|
| AddIcon | MaterialIcons | "add" |
| SearchIcon | Ionicons | "search" |
| CloseIcon | AntDesign | "close" |
| CheckIcon | MaterialIcons | "check" |
| ChevronDownIcon | MaterialIcons | "keyboard-arrow-down" |
| ChevronUpIcon | MaterialIcons | "keyboard-arrow-up" |
| ChevronLeftIcon | MaterialIcons | "keyboard-arrow-left" |
| ChevronRightIcon | MaterialIcons | "keyboard-arrow-right" |
| EditIcon | MaterialIcons | "edit" |
| DeleteIcon | MaterialIcons | "delete" |
| SettingsIcon | Ionicons | "settings" |
| HomeIcon | Ionicons | "home" |
| UserIcon | FontAwesome | "user" |
| CalendarIcon | Ionicons | "calendar" |
| LocationIcon | Ionicons | "location" |

---

## Custom Components Created During Migration

### 1. Toast Component
Since React Native Elements doesn't have a built-in Toast, we created a custom implementation:

```tsx
// components/molecules/Toast.tsx
import React from 'react';
import { Overlay, Text } from '@rneui/themed';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}) => {
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  const backgroundColor = {
    success: '#4CAF50',
    error: '#F44336',
    info: '#2196F3',
  }[type];

  return (
    <Overlay
      isVisible={visible}
      overlayStyle={{
        position: 'absolute',
        bottom: 100,
        backgroundColor,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
      }}
    >
      <Text style={{ color: 'white' }}>{message}</Text>
    </Overlay>
  );
};
```

### 2. Select/Dropdown Component
Custom dropdown implementation using React Native Elements:

```tsx
// components/molecules/Dropdown.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import { Text, Overlay, ListItem } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';

interface DropdownProps {
  options: Array<{ label: string; value: string }>;
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onSelect,
  placeholder = 'Select...',
}) => {
  const [visible, setVisible] = useState(false);
  const selected = options.find(opt => opt.value === value);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#e0e0e0',
          borderRadius: 8,
          padding: 12,
        }}
      >
        <Text>{selected?.label || placeholder}</Text>
        <MaterialIcons name="arrow-drop-down" size={24} />
      </TouchableOpacity>

      <Overlay
        isVisible={visible}
        onBackdropPress={() => setVisible(false)}
        overlayStyle={{ width: '80%', maxHeight: '50%' }}
      >
        <FlatList
          data={options}
          keyExtractor={item => item.value}
          renderItem={({ item }) => (
            <ListItem
              onPress={() => {
                onSelect(item.value);
                setVisible(false);
              }}
              bottomDivider
            >
              <ListItem.Content>
                <ListItem.Title>{item.label}</ListItem.Title>
              </ListItem.Content>
              {value === item.value && (
                <MaterialIcons name="check" size={20} />
              )}
            </ListItem>
          )}
        />
      </Overlay>
    </>
  );
};
```

---

## Style Migration Patterns

### Theme Variables Mapping

| Gluestack Theme Variable | React Native Elements Theme Path |
|-------------------------|----------------------------------|
| `$primary` | `theme.colors.primary` |
| `$secondary` | `theme.colors.secondary` |
| `$text` | `theme.colors.black` |
| `$background` | `theme.colors.white` |
| `$border` | `theme.colors.grey4` |
| `$error` | `theme.colors.error` |
| `$success` | `theme.colors.success` |
| `$warning` | `theme.colors.warning` |
| `$muted` | `theme.colors.grey3` |

### Spacing System

| Gluestack Space | Pixel Value | RNE Theme |
|-----------------|-------------|-----------|
| `xs` | 4px | `theme.spacing.xs` |
| `sm` | 8px | `theme.spacing.sm` |
| `md` | 16px | `theme.spacing.md` |
| `lg` | 24px | `theme.spacing.lg` |
| `xl` | 32px | `theme.spacing.xl` |

---

## Common Migration Patterns

### Pattern 1: Nested Component Structure → Flat Props
**Gluestack:** Uses nested components for composition
**RNE:** Uses props for configuration

### Pattern 2: Variant System → Style Props
**Gluestack:** `variant="solid"` `action="primary"`
**RNE:** `buttonStyle={{ backgroundColor: 'blue' }}`

### Pattern 3: Size Props → Style Values
**Gluestack:** `size="md"`
**RNE:** Explicit pixel/percentage values

### Pattern 4: Built-in Icons → External Icon Library
**Gluestack:** Includes icon components
**RNE:** Use @expo/vector-icons

---

## Migration Checklist

When migrating a component:
1. ✅ Identify the equivalent RNE component
2. ✅ Map props to new structure
3. ✅ Update imports
4. ✅ Apply theme values
5. ✅ Test functionality
6. ✅ Verify styling
7. ✅ Check accessibility
8. ✅ Update tests

---

## Functionality Differences

### Components with Different Behavior

1. **Modal/Overlay**
   - Gluestack: Built-in header/footer structure
   - RNE: Requires manual layout

2. **Select/Dropdown**
   - Gluestack: Native select component
   - RNE: Custom implementation required

3. **Toast**
   - Gluestack: Built-in toast system
   - RNE: Custom implementation required

4. **Form Validation**
   - Gluestack: Built-in validation
   - RNE: Manual validation or third-party library

---

## Performance Considerations

### Optimization Tips
1. Use `React.memo` for complex custom components
2. Implement `getItemLayout` for FlatLists
3. Use `initialNumToRender` for long lists
4. Lazy load heavy components
5. Optimize image sizes and use caching

### Bundle Size Impact
- Removed: ~800KB (Gluestack UI + dependencies)
- Added: ~400KB (React Native Elements + icons)
- Net reduction: ~400KB

---

*Last Updated: 2025-08-14*
*Status: Complete*