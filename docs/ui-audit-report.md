# UI Component Audit Report
Generated: 2025-01-12

## Executive Summary
Total files requiring migration: 45 files with Chakra UI dependencies
Components with inline styles: 20+ files need theme migration

## Non-RNE UI Library Dependencies

### Chakra UI Components (45 files)
#### Test Files (26 files) - ChakraProvider imports
- components/features/event/TicketQuantityPicker.spec.tsx
- components/features/event/TicketTypeSelector.spec.tsx
- components/features/organizer/AttendeeManagementPage.spec.tsx
- components/features/organizer/CameraScanner.spec.tsx
- components/features/organizer/CheckInErrorModal.spec.tsx
- components/features/organizer/CheckInModeScreen.e2e.spec.tsx
- components/features/organizer/CheckInModeScreen.spec.tsx
- components/features/organizer/CheckInStatisticsHeader.spec.tsx
- components/features/organizer/CheckInSuccessModal.spec.tsx
- components/features/organizer/ReportExportControls.spec.tsx
- components/features/organizer/ReportVisualization.spec.tsx
- components/ui/Pagination.spec.tsx
- components/features/auth/ForgotPasswordForm.spec.tsx
- components/features/auth/GoogleSignInButton.spec.tsx
- components/features/auth/LoginForm.spec.tsx
- components/features/auth/ProfilePage.spec.tsx
- components/features/auth/RegisterForm.spec.tsx
- components/features/auth/ResetPasswordForm.spec.tsx
- components/features/event/DiscountCodeForm.spec.tsx
- components/features/event/DiscountCodeInput.spec.tsx
- components/features/event/DiscountCodeList.spec.tsx
- components/features/event/DynamicFieldRenderer.spec.tsx
- components/features/event/EventCreateForm.spec.tsx
- components/features/event/EventManagement.spec.tsx
- components/features/event/EventsList.spec.tsx
- components/features/event/EventStatusManager.spec.tsx
- components/features/event/PaymentStep.simple.spec.tsx
- components/features/event/SeatingConfiguration.spec.tsx
- components/features/event/TicketConfiguration.spec.tsx

#### Production Components (19 files) - Chakra Icons & Components
- components/ui/Pagination.tsx (ChevronLeftIcon, ChevronRightIcon)
- components/features/organizer/AttendeeSearchForm.tsx (SearchIcon, CloseIcon)
- components/features/organizer/AttendeeSearchResults.tsx (CheckIcon, InfoIcon)
- components/features/organizer/CheckInErrorModal.tsx (WarningIcon, NotAllowedIcon, InfoIcon)
- components/features/organizer/CheckInStatisticsHeader.tsx (RepeatIcon)
- components/features/organizer/CheckInSuccessModal.tsx (CheckCircleIcon)
- components/features/organizer/ManualCheckInButton.tsx (CheckIcon, WarningIcon)
- components/features/organizer/PaymentProviderCredentialsForm.tsx (CheckIcon, InfoIcon, WarningIcon)
- components/features/registration/RegistrationConfirmationPage.tsx (CheckIcon, DownloadIcon, ViewIcon, ExternalLinkIcon)
- components/features/auth/GoogleSignInButton.tsx
- components/features/event/DiscountCodeCard.tsx
- components/features/event/DiscountCodeList.tsx
- components/features/event/ECPayPaymentForm.tsx
- components/features/event/EventManagement.tsx
- components/features/event/SeatingConfiguration.tsx
- components/features/event/TicketConfiguration.tsx

## Components with Inline Styles (20 files)
Files using hardcoded colors, padding, or margins instead of theme:
- components/features/organizer/ExportHistoryList.tsx
- components/features/organizer/ExportProgressModal.tsx
- components/atoms/ExportProgressBar.tsx
- components/molecules/ExportFormatSelector.tsx
- components/features/organizer/ExportOptionsModal.tsx
- components/features/admin/UserManagementTable.tsx
- components/features/user/QRCodeModal.tsx
- components/features/user/TicketCard.tsx
- components/features/organizer/DiscountCodeFormModal.tsx
- components/features/organizer/DiscountCodeManagementList.tsx
- components/features/organizer/FinancialReports.tsx
- components/features/organizer/ReportFilters.tsx
- components/features/organizer/EventDataTable.tsx
- components/molecules/PDFPreviewModal.tsx
- components/features/organizer/InvoiceSettingsModal.tsx
- components/atoms/PaymentSkeleton.tsx
- components/features/event/PaymentStep.tsx
- components/features/organizer/OrganizerDashboard.tsx
- components/features/organizer/DashboardCharts.tsx
- components/features/organizer/DashboardFilters.tsx

## Migration Checklist

### Priority 1: Remove Chakra UI Dependencies
- [ ] Replace Chakra icons with @expo/vector-icons equivalents
- [ ] Update test files to use RNE ThemeProvider
- [ ] Remove all @chakra-ui package imports

### Priority 2: Create Shared Components
- [ ] SharedButton
- [ ] SharedCard
- [ ] SharedModal
- [ ] SharedList
- [ ] SharedForm components

### Priority 3: Implement 8pt Grid System
- [ ] Add spacing constants to theme
- [ ] Create useSpacing hook
- [ ] Replace hardcoded spacing values

### Priority 4: Standardize Existing Components
- [ ] Update atoms/ components
- [ ] Update molecules/ components
- [ ] Update organisms/ components
- [ ] Update features/ components

## Icon Mapping Guide
Chakra UI → @expo/vector-icons replacements:
- ChevronLeftIcon → MaterialIcons.chevron-left
- ChevronRightIcon → MaterialIcons.chevron-right
- SearchIcon → MaterialIcons.search
- CloseIcon → MaterialIcons.close
- CheckIcon → MaterialIcons.check
- InfoIcon → MaterialIcons.info
- WarningIcon → MaterialIcons.warning
- NotAllowedIcon → MaterialIcons.block
- CheckCircleIcon → MaterialIcons.check-circle
- RepeatIcon → MaterialIcons.refresh
- DownloadIcon → MaterialIcons.download
- ViewIcon → MaterialIcons.visibility
- ExternalLinkIcon → MaterialIcons.open-in-new

## Estimated Effort
- Chakra UI removal: 2 days
- Shared component creation: 1 day
- Spacing system: 0.5 days
- Component standardization: 1.5 days
- Testing & validation: 1 day
Total: ~6 days