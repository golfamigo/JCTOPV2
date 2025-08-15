# JCTOPV2 - Event Management Platform

## 📱 Overview

JCTOPV2 is a comprehensive event management platform built with React Native and Expo, designed to streamline event creation, registration, and management. The platform supports event organizers, attendees, and platform administrators with a rich set of features including ticket sales, QR code check-ins, and analytics.

### Key Features
- 🎫 **Event Management** - Create and manage events with multiple ticket types
- 👥 **User Registration** - Seamless registration flow with payment integration
- 📊 **Analytics Dashboard** - Real-time event statistics and insights
- 🔍 **Event Discovery** - Browse and search for events
- 📱 **QR Code Check-in** - Digital ticket validation
- 🌏 **Localization** - Full Traditional Chinese (繁體中文) support
- ♿ **Accessibility** - WCAG 2.1 AA compliant

## 🏗️ Architecture

### Tech Stack
- **Framework:** Expo SDK 53
- **Language:** TypeScript
- **UI Library:** React Native Elements (@rneui/themed)
- **Navigation:** React Navigation
- **State Management:** Zustand
- **API Client:** Axios
- **Localization:** i18next + react-i18next
- **Icons:** @expo/vector-icons
- **Testing:** Jest + React Testing Library

### Project Structure
```
JCTOPV2/
├── apps/
│   ├── client/          # React Native Expo app
│   │   ├── src/
│   │   │   ├── app/     # Screen components (Expo Router)
│   │   │   ├── components/
│   │   │   │   ├── atoms/      # Basic UI components
│   │   │   │   ├── molecules/  # Composite components
│   │   │   │   └── organisms/  # Complex components
│   │   │   ├── services/       # API and business logic
│   │   │   ├── theme/          # Theme configuration
│   │   │   ├── localization/   # i18n configuration
│   │   │   └── utils/          # Utility functions
│   │   └── app.json     # Expo configuration
│   └── server/          # Backend API (reference only)
├── packages/
│   └── shared-types/    # Shared TypeScript types
└── docs/                # Documentation
```

## 🚀 Prerequisites

### System Requirements
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Platform:** macOS, Windows 10/11, or Linux
- **Mobile:** iOS 13+ or Android 8+ for testing

### Development Tools
- **Expo CLI:** Installed globally or via npx
- **TypeScript:** 5.0+ (installed as dependency)
- **Git:** For version control
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/JCTOPV2.git
cd JCTOPV2
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd apps/client
npm install
```

### 3. Environment Configuration

Create `.env` file in `apps/client/`:
```env
# API Configuration
EXPO_PUBLIC_API_URL=https://jctop.zeabur.app/api/v1

# Optional: Development overrides
EXPO_PUBLIC_DEV_API_URL=http://localhost:3000/api/v1
```

### 4. Install Expo Development Tools
```bash
# Install Expo CLI globally (optional)
npm install -g expo-cli

# Or use npx (recommended)
npx expo --version
```

## 🏃 Running the Application

### Development Mode
```bash
cd apps/client

# Start Expo development server
npm start

# Or with specific platform
npm run ios     # iOS Simulator (macOS only)
npm run android # Android Emulator
npm run web     # Web browser
```

### Using Expo Go App
1. Install Expo Go on your mobile device
2. Scan the QR code from terminal
3. App will load on your device

### Development Commands
```bash
# Clear cache and restart
npm start -c

# Run with production environment
npx expo start --no-dev --minify

# Check for issues
npx expo doctor
```

## 🧪 Testing

### Run Tests
```bash
cd apps/client

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- EventCard.spec.tsx
```

### Test Categories
- **Unit Tests:** Component and service tests
- **Integration Tests:** User flow tests
- **Accessibility Tests:** WCAG compliance checks

### Linting and Type Checking
```bash
# Run ESLint
npm run lint

# Run TypeScript compiler
npm run typecheck

# Fix linting issues
npm run lint -- --fix
```

## 📱 Building for Production

### Prerequisites
- Expo account (for EAS Build)
- Apple Developer account (for iOS)
- Google Play Console account (for Android)

### Build Commands
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both platforms
eas build --platform all
```

### Local Builds
```bash
# iOS (macOS only)
npx expo run:ios --configuration Release

# Android
npx expo run:android --variant Release
```

## 🚢 Deployment

### Web Deployment
```bash
# Build web version
npx expo export:web

# Deploy to hosting service
# (Vercel, Netlify, etc.)
```

### Mobile App Stores
1. **iOS App Store**
   - Build with EAS: `eas build --platform ios`
   - Submit: `eas submit --platform ios`

2. **Google Play Store**
   - Build with EAS: `eas build --platform android`
   - Submit: `eas submit --platform android`

### Environment Variables for Production
Configure in EAS or CI/CD:
- `EXPO_PUBLIC_API_URL` - Production API endpoint
- `SENTRY_DSN` - Error tracking (optional)
- `ANALYTICS_ID` - Analytics tracking (optional)

## 🔧 Development Workflow

### Git Branch Strategy
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches
- `release/*` - Release preparation

### Commit Convention
Follow conventional commits:
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

### Code Style
- **ESLint:** Enforced on commit
- **Prettier:** Auto-format on save
- **TypeScript:** Strict mode enabled

### Pull Request Process
1. Create feature branch from `develop`
2. Implement changes with tests
3. Run `npm run lint` and `npm test`
4. Create PR with description
5. Code review required
6. Merge after approval

## 📚 Documentation

### Available Documentation
- [Migration Guide](docs/migration/migration-guide.md) - UI framework migration details
- [Component Library](docs/frontend/component-library.md) - Component documentation
- [Style Guide](docs/frontend/react-native-elements-style-guide.md) - Styling patterns
- [Localization Guide](docs/frontend/localization-guide.md) - i18n implementation
- [Testing Guide](docs/testing-best-practices.md) - Testing strategies
- [API Documentation](docs/api/README.md) - Backend API reference

### Architecture Documents
- [Technical Stack](docs/current/architecture/3-技術棧對齊-tech-stack-alignment.md)
- [Component Architecture](docs/current/architecture/5-元件架構-component-architecture.md)
- [Source Tree Integration](docs/current/architecture/6-源碼樹整合-source-tree-integration.md)

## 🐛 Debugging

### Common Issues

#### Metro Bundler Issues
```bash
# Clear Metro cache
npx expo start -c

# Reset watchman
watchman watch-del-all
```

#### Dependency Issues
```bash
# Clear all caches
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

#### iOS Simulator Issues
```bash
# Reset simulator
xcrun simctl erase all

# Clear derived data
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Debug Tools
- **React Native Debugger** - Standalone debugger
- **Flipper** - Mobile app debugging platform
- **Expo Developer Tools** - Built-in web interface
- **Chrome DevTools** - For web debugging

### Performance Profiling
```bash
# Enable performance monitor
# Shake device or press Cmd+D (iOS) / Cmd+M (Android)
# Select "Show Perf Monitor"
```

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create your feature branch
3. Follow coding standards
4. Write tests for new features
5. Submit pull request

### Code Review Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] TypeScript compiles
- [ ] Documentation updated
- [ ] Accessibility checked
- [ ] Performance impact assessed

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

### Resources
- [Documentation](docs/README.md)
- [Known Issues](docs/known-issues.md)
- [Troubleshooting Guide](docs/migration/migration-guide.md#troubleshooting-guide)

### Contact
- Technical Issues: Create GitHub issue
- Security Issues: security@jctop.com
- General Inquiries: support@jctop.com

---

**Version:** 2.0.0  
**Last Updated:** 2025-08-14  
**Status:** Production Ready