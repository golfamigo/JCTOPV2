# Developer Onboarding Guide

Welcome to the JCTOPV2 development team! This guide will help you get up and running quickly with our event management platform.

## 🎯 Quick Start (15 minutes)

### Prerequisites Check
```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version (should be 9+)
npm --version

# Check Git
git --version
```

### Fast Setup
```bash
# 1. Clone the repository
git clone https://github.com/your-org/JCTOPV2.git
cd JCTOPV2

# 2. Install dependencies
npm install
cd apps/client && npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your API endpoint

# 4. Start development
npm start

# 5. Scan QR code with Expo Go app on your phone
```

## 📚 Project Overview

### What is JCTOPV2?
JCTOPV2 is a comprehensive event management platform that enables:
- Event organizers to create and manage events
- Users to discover and register for events
- Digital ticketing with QR codes
- Analytics and reporting
- Full Traditional Chinese support

### Tech Stack at a Glance
- **Frontend**: React Native + Expo SDK 53
- **UI Library**: React Native Elements
- **Language**: TypeScript
- **State**: Zustand
- **Navigation**: React Navigation
- **Localization**: i18next
- **Testing**: Jest + React Testing Library

### Project Structure
```
JCTOPV2/
├── apps/
│   ├── client/         # Mobile app (your main focus)
│   │   ├── src/
│   │   │   ├── app/           # Screens (Expo Router)
│   │   │   ├── components/    # UI components
│   │   │   ├── services/      # API services
│   │   │   ├── utils/         # Utilities
│   │   │   ├── theme/         # Theme config
│   │   │   └── localization/  # i18n
│   │   └── app.json
│   └── server/         # Backend API (reference)
├── packages/
│   └── shared-types/   # Shared TypeScript types
└── docs/              # Documentation
```

## 🛠️ Development Workflow

### 1. Branch Strategy
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Create bug fix branch
git checkout -b fix/bug-description

# Always branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/new-feature
```

### 2. Development Cycle
```bash
# 1. Make changes
# 2. Test your changes
npm test

# 3. Check linting
npm run lint

# 4. Check types
npm run typecheck

# 5. Commit with conventional commits
git add .
git commit -m "feat: add new feature"
# or
git commit -m "fix: resolve issue with..."
```

### 3. Pull Request Process
1. Push your branch
2. Create PR to `develop` branch
3. Fill out PR template
4. Request review from 2 team members
5. Address feedback
6. Merge after approval

## 💻 Common Development Tasks

### Running the App

```bash
cd apps/client

# Start Expo dev server
npm start

# Run on iOS Simulator (Mac only)
npm run ios

# Run on Android Emulator
npm run android

# Run on web browser
npm run web

# Clear cache and restart
npm start -c
```

### Working with Components

#### Creating a New Component
```tsx
// 1. Determine component type (atom/molecule/organism)
// 2. Create file in appropriate folder

// Example: components/atoms/CustomButton.tsx
import React from 'react';
import { Button } from '@rneui/themed';
import { useTheme } from '@rneui/themed';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  onPress 
}) => {
  const { theme } = useTheme();
  
  return (
    <Button
      title={title}
      onPress={onPress}
      buttonStyle={{
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
      }}
    />
  );
};
```

#### Using Localization
```tsx
import { useTranslation } from 'react-i18next';

const MyScreen = () => {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('common.welcome')}</Text>
      <Button title={t('auth.login')} />
    </View>
  );
};
```

### API Integration

#### Making API Calls
```typescript
// services/eventService.ts
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const eventService = {
  async getEvents() {
    const response = await axios.get(`${API_URL}/events`);
    return response.data;
  },
  
  async getEventById(id: string) {
    const response = await axios.get(`${API_URL}/events/${id}`);
    return response.data;
  },
};
```

### Testing

#### Writing Tests
```tsx
// Component test example
import { render, fireEvent } from '@testing-library/react-native';
import { CustomButton } from './CustomButton';

describe('CustomButton', () => {
  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <CustomButton title="Test" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Test'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

#### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test CustomButton.spec.tsx
```

## 🎨 UI Development Guidelines

### Theme Usage
Always use theme values, never hardcode:
```tsx
// ✅ Good
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
});

// ❌ Bad
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
});
```

### Component Hierarchy
Follow Atomic Design:
- **Atoms**: Basic building blocks (Button, Input, Text)
- **Molecules**: Simple groups (FormField, Card)
- **Organisms**: Complex components (Header, EventCard)

### Responsive Design
```tsx
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const styles = StyleSheet.create({
  container: {
    padding: isTablet ? 24 : 16,
  },
});
```

## 🐛 Debugging Tips

### Using React Native Debugger
1. Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
2. Select "Debug Remote JS"
3. Open React Native Debugger app

### Console Logging
```tsx
// Use console.log for debugging
console.log('Event data:', eventData);

// Remove before committing!
// Use ESLint to catch these
```

### Common Issues

#### Metro Bundler Issues
```bash
# Clear cache
npx expo start -c

# Reset everything
rm -rf node_modules
npm install
npx expo start -c
```

#### Type Errors
```bash
# Check TypeScript errors
npm run typecheck

# Fix common issues
# - Missing types: Add type definitions
# - Import errors: Check file paths
```

## 📋 Code Review Checklist

Before submitting PR, ensure:
- [ ] Code follows TypeScript best practices
- [ ] Components use React Native Elements consistently
- [ ] All text uses i18n (no hardcoded strings)
- [ ] Tests are written and passing
- [ ] No console.log statements
- [ ] Accessibility labels added
- [ ] Performance impact considered
- [ ] Documentation updated if needed

## 🔧 Useful Commands

```bash
# Development
npm start              # Start Expo dev server
npm run ios           # Run on iOS
npm run android       # Run on Android
npm run web           # Run on web

# Testing
npm test              # Run tests
npm run lint          # Check linting
npm run typecheck     # Check types

# Building
npx expo export       # Export for web
eas build            # Build with EAS

# Utilities
npx expo doctor       # Check for issues
npm outdated         # Check for updates
```

## 📖 Important Documentation

### Internal Docs
- [Architecture Overview](./current/architecture/index.md)
- [Component Library](./frontend/component-library.md)
- [Style Guide](./frontend/react-native-elements-style-guide.md)
- [Localization Guide](./frontend/localization-guide.md)
- [Testing Guide](./testing-best-practices.md)
- [Migration Guide](./migration/migration-guide.md)

### External Resources
- [React Native Elements](https://reactnativeelements.com/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Getting Help

### Team Communication
- **Slack Channel**: #jctopv2-dev
- **Daily Standup**: 10:00 AM
- **Code Review**: Tag @frontend-team
- **Questions**: Ask in #dev-help

### Key Contacts
- **Tech Lead**: For architecture decisions
- **Product Owner**: For feature clarifications
- **QA Lead**: For testing strategies
- **DevOps**: For deployment issues

## 🚀 Your First Tasks

### Week 1 Checklist
- [ ] Set up development environment
- [ ] Run the app successfully
- [ ] Read the style guide
- [ ] Complete a small bug fix or feature
- [ ] Submit your first PR
- [ ] Attend team standup

### Starter Issues
Look for issues labeled:
- `good-first-issue`
- `beginner-friendly`
- `documentation`
- `bug-fix-simple`

## 💡 Pro Tips

1. **Use VS Code** with these extensions:
   - ESLint
   - Prettier
   - TypeScript and JavaScript Language Features
   - React Native Tools

2. **Keyboard Shortcuts**:
   - `Cmd+Shift+P`: VS Code command palette
   - `Cmd+P`: Quick file open
   - `Cmd+Shift+F`: Search across files

3. **Performance**:
   - Use `React.memo` for expensive components
   - Implement `getItemLayout` for long lists
   - Profile with React DevTools

4. **Stay Updated**:
   - Check #announcements daily
   - Review PR comments for learning
   - Attend tech talks and demos

## 📝 Notes Section

Use this space for your personal notes:
```
Your notes here...
```

---

**Welcome aboard!** 🎉

Remember: Don't hesitate to ask questions. We're here to help you succeed!

*Last Updated: 2025-08-14*
*Version: 1.0.0*