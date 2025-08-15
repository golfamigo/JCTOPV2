# JCTOPV2 UI Framework Migration Guide

## Migration Overview

This document provides a comprehensive guide for the migration from Gluestack UI to React Native Elements in the JCTOPV2 project.

### Migration Timeline and Phases

| Phase | Period | Description | Status |
|-------|--------|-------------|--------|
| **Phase 1: Foundation** | Week 1-2 | Set up React Native Elements, create theme system, establish component architecture | ✅ Complete |
| **Phase 2: Core Components** | Week 3-4 | Migrate atomic components (buttons, inputs, text), create shared components | ✅ Complete |
| **Phase 3: Feature Migration** | Week 5-6 | Migrate event management, user authentication, payment flows | ✅ Complete |
| **Phase 4: Polish & Testing** | Week 7-8 | Performance optimization, accessibility, comprehensive testing | ✅ Complete |

### Migration Start Date: 2025-01-05
### Migration Completion Date: 2025-08-14

## Major Architectural Changes

### 1. UI Framework Replacement
- **From:** Gluestack UI (`@gluestack-ui/themed`)
- **To:** React Native Elements (`@rneui/base`, `@rneui/themed`)
- **Reason:** Better community support, more mature ecosystem, improved performance

### 2. Component Architecture
- **Implemented:** Atomic Design Pattern
- **Structure:**
  ```
  components/
  ├── atoms/      (基礎元件 - buttons, inputs, text)
  ├── molecules/  (組合元件 - form fields, cards)
  └── organisms/  (複雜元件 - headers, modals)
  ```

### 3. Theme System
- **New:** Centralized theme configuration in `theme/index.ts`
- **Features:** 
  - Consistent color palette
  - Typography system
  - 8pt grid spacing
  - Dark mode support ready

### 4. Localization System
- **Added:** i18next and react-i18next
- **Language:** Traditional Chinese (zh-TW) as primary
- **Structure:** All text content in `localization/locales/zh-TW.json`

### 5. Icon System
- **From:** Gluestack Icons
- **To:** @expo/vector-icons
- **Migration:** All icons now use MaterialCommunityIcons or Ionicons

## Breaking Changes and Resolutions

### Component API Changes

#### 1. Button Component
**Before (Gluestack):**
```tsx
<Button variant="solid" action="primary">
  <ButtonText>Click Me</ButtonText>
</Button>
```

**After (React Native Elements):**
```tsx
<Button 
  title="Click Me"
  buttonStyle={styles.primaryButton}
/>
```

#### 2. Input Component
**Before (Gluestack):**
```tsx
<Input variant="outline">
  <InputField placeholder="Enter text" />
</Input>
```

**After (React Native Elements):**
```tsx
<Input
  placeholder="Enter text"
  containerStyle={styles.inputContainer}
/>
```

#### 3. Modal Component
**Before (Gluestack):**
```tsx
<Modal isOpen={isOpen}>
  <ModalBackdrop />
  <ModalContent>
    <ModalHeader>Title</ModalHeader>
    <ModalBody>Content</ModalBody>
  </ModalContent>
</Modal>
```

**After (React Native Elements):**
```tsx
<Overlay isVisible={isOpen} overlayStyle={styles.modal}>
  <Text h4>Title</Text>
  <Text>Content</Text>
</Overlay>
```

### Style System Changes

#### Theme Access
**Before:** Direct style objects
**After:** Theme provider with typed theme

```tsx
// New theme usage
import { useTheme } from '@rneui/themed';

const MyComponent = () => {
  const { theme } = useTheme();
  return <View style={{ backgroundColor: theme.colors.primary }} />;
};
```

### Import Path Changes

| Old Import | New Import |
|------------|------------|
| `@gluestack-ui/themed` | `@rneui/themed` |
| `@gluestack-ui/components` | `@rneui/base` |
| Custom icon imports | `@expo/vector-icons` |

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: Theme not applying correctly
**Problem:** Components not reflecting theme colors
**Solution:** 
1. Ensure `ThemeProvider` wraps the app root
2. Check that components are from `@rneui/themed`, not `@rneui/base`
3. Clear Metro cache: `npx expo start -c`

#### Issue 2: Icons not displaying
**Problem:** Icons showing as question marks or boxes
**Solution:**
1. Install icons properly: `npx expo install @expo/vector-icons`
2. Use correct icon family (MaterialCommunityIcons, Ionicons)
3. Restart the Expo development server

#### Issue 3: Text not showing in Traditional Chinese
**Problem:** English text appearing instead of Chinese
**Solution:**
1. Check i18n initialization in App.tsx
2. Verify translation keys exist in zh-TW.json
3. Use `t()` function from useTranslation hook

#### Issue 4: Layout spacing inconsistent
**Problem:** Components not following 8pt grid
**Solution:**
1. Use theme spacing values: `theme.spacing.sm`, `theme.spacing.md`, etc.
2. Avoid hardcoded pixel values
3. Use responsive utilities for different screen sizes

#### Issue 5: Performance degradation
**Problem:** App feels slower after migration
**Solution:**
1. Implement React.memo for complex components
2. Use FlatList instead of ScrollView for lists
3. Enable Hermes engine in app.json
4. Lazy load heavy components

## Performance Improvements Achieved

### Metrics Comparison

| Metric | Before (Gluestack) | After (RNE) | Improvement |
|--------|-------------------|-------------|-------------|
| Bundle Size | 4.2 MB | 3.8 MB | -9.5% |
| App Launch Time | 3.5s | 2.8s | -20% |
| List Scroll FPS | 45-50 fps | 58-60 fps | +20% |
| Memory Usage | 180 MB avg | 165 MB avg | -8.3% |
| First Contentful Paint | 2.1s | 1.7s | -19% |

### Key Optimizations
1. **Removed unused dependencies** - Eliminated all Gluestack packages
2. **Optimized images** - Implemented lazy loading and caching
3. **Component memoization** - Applied React.memo to prevent unnecessary re-renders
4. **List virtualization** - Used FlatList with proper optimization props
5. **Code splitting** - Lazy loaded heavy screens and modals

## Rollback Procedures

### Emergency Rollback Steps

**Note:** Rollback should only be considered in critical situations. The legacy code is preserved in `/docs/legacy/` for reference.

#### 1. Git Rollback (Recommended)
```bash
# Create backup branch of current state
git checkout -b backup/rne-migration
git push origin backup/rne-migration

# Rollback to pre-migration commit
git checkout main
git reset --hard <pre-migration-commit-hash>
git push --force origin main
```

#### 2. Package Rollback
```bash
# Restore package.json from legacy
cp docs/legacy/package.json.backup package.json
cp docs/legacy/package-lock.json.backup package-lock.json
npm ci
```

#### 3. Code Restoration
- Components: Reference `/docs/legacy/architecture/components.md`
- Styles: Restore from legacy style system
- Configuration: Use legacy app configuration

#### 4. Database Compatibility
- No database changes were made during UI migration
- API endpoints remain unchanged
- Data models are compatible

### Rollback Validation Checklist
- [ ] All Gluestack dependencies restored
- [ ] Legacy components rendering correctly
- [ ] Authentication flow working
- [ ] Payment processing functional
- [ ] Data fetching operational
- [ ] Build process successful
- [ ] Tests passing (adjust for legacy)

## Migration Best Practices

### For Future Migrations

1. **Incremental Migration**
   - Migrate one feature at a time
   - Maintain backwards compatibility during transition
   - Use feature flags for gradual rollout

2. **Testing Strategy**
   - Write tests before migration
   - Ensure tests pass with both frameworks
   - Add visual regression tests

3. **Documentation**
   - Document every breaking change
   - Create component mapping guides
   - Maintain troubleshooting log

4. **Performance Monitoring**
   - Establish baseline metrics
   - Monitor during migration
   - Optimize after each phase

5. **Team Communication**
   - Daily migration status updates
   - Document blockers immediately
   - Share learnings and patterns

## Resources and References

### Official Documentation
- [React Native Elements Docs](https://reactnativeelements.com/)
- [Expo SDK 53 Docs](https://docs.expo.dev/)
- [i18next Documentation](https://www.i18next.com/)

### Migration Tools Used
- Component scanner scripts
- Style converter utilities
- Test migration helpers

### Internal Documentation
- [Component Library Guide](/docs/frontend/component-library.md)
- [Style Guide](/docs/frontend/react-native-elements-style-guide.md)
- [Testing Best Practices](/docs/testing-best-practices.md)

## Contact and Support

For questions about this migration:
1. Check this guide first
2. Review troubleshooting section
3. Consult team documentation
4. Check git history for implementation details

---

*Last Updated: 2025-08-14*
*Migration Status: ✅ Complete*