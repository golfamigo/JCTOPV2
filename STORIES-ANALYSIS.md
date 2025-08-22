# JCTOP Stories 完整分析報告

## 系統章節分類

### 📌 Chapter 1: 使用者認證系統 (1.1-1.8)
- Story 1.1: Project Scaffolding
- Story 1.2: Database & Core Service Setup
- Story 1.3: User Model & Database Migration
- Story 1.4: Email & Password Registration
- Story 1.5: User Login & Session Management
- Story 1.6: User Profile Management
- Story 1.7: Third-Party Login (Google)
- Story 1.8: Password Reset Flow

### 📅 Chapter 2: 活動管理系統 (2.1-2.6)
- Story 2.1: Event Data Model & Database Migration
- Story 2.2: Basic Event Creation Form
- Story 2.3: Event Ticket & Seating Configuration
- Story 2.4: Event Publishing & Status Management
- Story 2.5: Public Event List & Discovery Page
- Story 2.6: Organizer Dashboard Migration

### 💳 Chapter 3: 註冊與支付系統 (3.1-3.8)
- Story 3.1: Discount Code Management
- Story 3.2: Registration Form - Ticket Selection
- Story 3.3: Registration Form - Custom Fields & Discount Code
- Story 3.4: Payment Gateway Service (ECPay Implementation)
- Story 3.5: Registration Confirmation & Ticket Generation
- Story 3.6: Attendee Management for Organizers
- Story 3.7: Platform Admin Dashboard
- Story 3.8: Export & Reporting Features

### ✅ Chapter 4: 報到與報表系統 (4.1-4.8)
- Story 4.1: Organizer Check-in Mode
- Story 4.2: QR Code Scanning & Validation
- Story 4.3: Manual Attendee Search & Check-in
- Story 4.4: Check-in Dashboard & Statistics
- Story 4.5: Post-Event Reporting
- Story 4.6: Final Localization Review
- Story 4.7: Testing & Quality Assurance
- Story 4.8: Migration Documentation & Handoff

### 🚀 Chapter 5: 部署與架構 (5.1-5.2)
- Story 5.1: Frontend Architecture Unification and Cleanup
- Story 5.2: Frontend Deployment to Zeabur

## 詳細頁面結構分析

### 1.1.story.md
**Story 1.1: Project Scaffolding**

頁面/路由：
  - 2. An Expo application is created within the monorepo (`apps/client`).
  - 3. A basic Node.js backend application is created within the monorepo (`apps/server`).
  - 4. Shared packages for common code (e.g., `packages/shared-types`) are created.
  - 5. Root `package.json` scripts are configured to run/build/test each application.
  -   - [x] Set up root package.json scripts for dev/build/test commands
  -   - [x] Initialize Expo app in `apps/client` directory using Expo SDK ~51.0
  -   - [x] Set up basic app structure with required directories (app/, src/, src/components/, src/stores/, src/services/)
  -   - [x] Initialize NestJS ~10.3 app in `apps/server` directory
  -   - [x] Set up features-based module structure (src/features/)
  -   - [x] Create `packages/shared-types` directory with TypeScript configuration

### 1.2.story.md
**Story 1.2: Database & Core Service Setup**

頁面/路由：
  - 2. A `/health` API endpoint is created.
  - 3. When the `/health` endpoint is called, it returns a `200 OK` status if the database connection is active.
  -   - [x] Install required database dependencies (@nestjs/typeorm, typeorm, pg, @types/pg)
  -   - [x] Create health check controller with GET /health endpoint
  - From Story 1.1 completion: NestJS backend (~10.3) is initialized with features-based module structure at `apps/server/src/features/`. TypeScript (~5.5) and Turborepo build pipeline are configured and working. Monorepo structure is established with shared-types package.
  - Backend Technologies [Source: architecture/tech-stack.md]:
  - Database Schema and Connection [Source: architecture/database-schema.md]:
  - - Connection string format: `postgresql://user:password@localhost:5432/jctop_event`
  - Environment Variables [Source: architecture/development-workflow.md]:
  - # Backend (apps/server/.env)

### 1.3.story.md
**Story 1.3: User Model & Database Migration**

頁面/路由：
  -   - [x] Export User interface from packages/shared-types/src/index.ts
  - From Story 1.2 completion: PostgreSQL database connection is established and working with TypeORM configuration. Database connection string format is confirmed: `postgresql://user:password@localhost:5432/jctop_event`. Health check endpoint validates database connectivity. NestJS backend (~10.3) is initialized with features-based module structure.
  - Backend Technologies [Source: architecture/tech-stack.md]:
  - User Interface [Source: architecture/data-models.md]:
  - User Relationships [Source: architecture/data-models.md]:
  - Users Table Definition [Source: architecture/database-schema.md]:
  - Based on Unified Project Structure [Source: architecture/unified-project-structure.md]:
  - packages/shared-types/src/
  - apps/server/src/
  - Critical Rules [Source: architecture/coding-standards.md]:

### 1.4.story.md
**Story 1.4: Email & Password Registration**

頁面/路由：
  -   - [x] Create RegisterUserDto in apps/server/src/features/auth/dto/register-user.dto.ts
  -   - [x] Create registration endpoint POST /auth/register in auth.controller.ts
  -   - [x] Return appropriate success/error responses
  -   - [x] Create RegisterForm.tsx in apps/client/src/components/features/auth/
  -   - [x] Create authService.ts in apps/client/src/services/
  - From Story 1.3 completion: PostgreSQL database connection is established and working with TypeORM configuration. User entity and database migration are complete. Database connection string format is confirmed: `postgresql://user:password@localhost:5432/jctop_event`. NestJS backend (~10.3) has features-based module structure with TypeORM repository pattern established. User table exists with UUID primary keys and proper indexes.
  - Technologies [Source: architecture/tech-stack.md]:
  - User Interface [Source: architecture/data-models.md]:
  - User Relationships [Source: architecture/data-models.md]:
  - Based on Unified Project Structure [Source: architecture/unified-project-structure.md]:

### 1.5.story.md
**Story 1.5: User Login & Session Management**

頁面/路由：
  -   - [x] Create LoginUserDto in apps/server/src/features/auth/dto/login-user.dto.ts
  -   - [x] Create login endpoint POST /auth/login in auth.controller.ts
  -   - [x] Generate JWT token with user payload using @nestjs/jwt
  -   - [x] Create LoginForm.tsx in apps/client/src/components/features/auth/
  - From Story 1.4: Email/password registration system will be implemented with bcrypt password hashing, User entity exists with email uniqueness validation. From Story 1.3: PostgreSQL database connection established, User table exists with UUID primary keys. NestJS backend has features-based module structure with TypeORM repository pattern.
  - Technologies [Source: architecture/tech-stack.md]:
  - JWT Login Flow [Source: architecture/backend-architecture.md]:
  -     FE->>BE: POST /auth/login (email, password)
  - JWT Auth Guard [Source: architecture/backend-architecture.md]:
  - import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

### 1.6.story.md
**Story 1.6: User Profile Management**

頁面/路由：
  -   - [x] Create UpdateUserDto in apps/server/src/features/auth/dto/update-user.dto.ts
  -   - [x] Create GET /auth/profile endpoint in auth.controller.ts
  -   - [x] Create PUT /auth/profile endpoint in auth.controller.ts
  -   - [x] Create ProfilePage.tsx in apps/client/src/components/features/auth/
  -   - [x] Update User interface in packages/shared-types to include optional phone field
  - From Story 1.5: JWT authentication system will be implemented with login/session management, JWT auth guards for route protection. From Story 1.4: User registration with bcrypt password hashing. From Story 1.3: User entity exists with TypeORM, database migration system established. NestJS backend has JWT authentication middleware configured.
  - Technologies [Source: architecture/tech-stack.md]:
  - Extended User Interface [Source: architecture/data-models.md + Story Extension]:
  - User Relationships [Source: architecture/data-models.md]:
  - Based on Unified Project Structure [Source: architecture/unified-project-structure.md]:

### 1.7.story.md
**Story 1.7: Third-Party Login (Google)**

頁面/路由：
  - 1. A "Sign in with Google" button is present on the login/registration page.
  -   - [x] Create GET /auth/google endpoint to initiate OAuth flow
  -   - [x] Create GET /auth/google/callback endpoint for OAuth callback
  -   - [x] Create GoogleSignInButton.tsx in apps/client/src/components/features/auth/
  - From Story 1.6: User profile management with JWT authentication protection. From Story 1.5: JWT authentication system with login/session management, auth guards implemented. From Story 1.4: Email registration with bcrypt password hashing. User entity exists with authProvider field supporting multiple authentication methods.
  - Technologies [Source: architecture/tech-stack.md]:
  - OAuth 2.0 Flow Requirements [Source: architecture/tech-stack.md]:
  - - Supports both local (email/pass) and federated (Google) authentication
  - Extended User Interface [Source: architecture/data-models.md + Story Extension]:
  - User Authentication Provider [Source: architecture/data-models.md]:

### 1.8.story.md
**Story 1.8: Password Reset Flow**

頁面/路由：
  -   - [x] Create ForgotPasswordDto in apps/server/src/features/auth/dto/forgot-password.dto.ts
  -   - [x] Create ResetPasswordDto in apps/server/src/features/auth/dto/reset-password.dto.ts
  -   - [x] Create POST /auth/forgot-password endpoint in auth.controller.ts
  -   - [x] Create POST /auth/reset-password endpoint in auth.controller.ts
  -   - [x] Create ForgotPasswordForm.tsx in apps/client/src/components/features/auth/
  -   - [x] Handle form submission and success/error states
  -   - [x] Create ResetPasswordForm.tsx in apps/client/src/components/features/auth/
  - From Story 1.7: Google OAuth authentication with user creation/identification logic. From Story 1.6: User profile management with JWT protection. From Story 1.5: JWT authentication system implemented. From Story 1.4: Email registration with bcrypt password hashing. User entity exists with proper password hashing infrastructure.
  - Technologies [Source: architecture/tech-stack.md]:
  - Existing User Interface [Source: architecture/data-models.md]:

### 2.1.story.md
**Story 2.1: Event Data Model & Database Migration**

頁面/路由：
  -   - [x] Export all interfaces from packages/shared-types/src/index.ts
  - From Story 1.3 completion: User data model and database migration are established. PostgreSQL database connection is working with TypeORM configuration. UUID extension is already created. Database connection string format confirmed: `postgresql://user:password@localhost:5432/jctop_event`. NestJS backend (~10.3) has features-based module structure with TypeORM repository pattern established.
  - Backend Technologies [Source: architecture/tech-stack.md]:
  - Event Interface [Source: architecture/data-models.md]:
  - Category Interface [Source: architecture/data-models.md]:
  - Venue Interface [Source: architecture/data-models.md]:
  - TicketType Interface [Source: architecture/data-models.md]:
  - Event Relationships [Source: architecture/data-models.md]:
  - Category Relationships [Source: architecture/data-models.md]:
  - Venue Relationships [Source: architecture/data-models.md]:

### 2.2.story.md
**Story 2.2: Basic Event Creation Form**

頁面/路由：
  -   - [x] Create CreateEventDto in apps/server/src/features/events/dto/create-event.dto.ts
  - - [x] Create POST /events API endpoint (AC: 3, 4)
  -   - [x] Create EventsController in apps/server/src/features/events/events.controller.ts
  -   - [x] Implement POST /events endpoint with authentication guard
  -   - [x] Create EventsService in apps/server/src/features/events/events.service.ts
  -   - [x] Create EventsModule in apps/server/src/features/events/events.module.ts
  -   - [x] Create EventCreateForm.tsx in apps/client/src/components/features/event/
  -   - [x] Create create-event.tsx page in apps/client/app/
  -   - [x] Create eventService.ts in apps/client/src/services/
  -   - [x] Use shared types from packages/shared-types

### 2.3.story.md
**Story 2.3: Event Ticket & Seating Configuration**

頁面/路由：
  - 2. An organizer can define basic seating areas/zones for the venue.
  -   - [x] Create SeatingZone entity in apps/server/src/entities/seating-zone.entity.ts
  -   - [x] Add SeatingZone to shared types in packages/shared-types/src/index.ts
  -   - [x] Create CreateTicketTypeDto in apps/server/src/features/events/dto/create-ticket-type.dto.ts
  -   - [x] Add POST /events/:eventId/ticket-types endpoint in EventsController
  -   - [x] Add PUT /events/:eventId/ticket-types/:ticketTypeId endpoint
  -   - [x] Add DELETE /events/:eventId/ticket-types/:ticketTypeId endpoint
  -   - [x] Add GET /events/:eventId/ticket-types endpoint
  -   - [x] Add POST /events/:eventId/seating-zones endpoint
  -   - [x] Add PUT /events/:eventId/seating-zones/:zoneId endpoint

### 2.4.story.md
**Story 2.4: Event Publishing & Status Management**

頁面/路由：
  -   - [x] Add Event entity to shared types in packages/shared-types/src/index.ts
  -   - [x] Create UpdateEventStatusDto in apps/server/src/features/events/dto/update-event-status.dto.ts
  -   - [x] Add PUT /events/:eventId/status endpoint in EventsController
  -   - [x] Add GET /events/:eventId/status-history endpoint for audit trail
  -   - [x] Modify GET /events endpoint to only return published events
  -   - [x] Update event search/filter functionality to respect status
  -   - [x] Create EventStatusManager.tsx in apps/client/src/components/features/event/
  -   - [x] Implement status change interface with dropdown/buttons using Chakra UI
  -   - [ ] Show status change history/audit trail
  -   - [x] Create eventStatusService.ts in apps/client/src/services/

### 2.5.story.md
**Story 2.5: Public Event List & Discovery Page**

頁面/路由：
  -   - [ ] Add GET /events endpoint to EventsController for public events
  -   - [ ] Create EventCard.tsx in apps/client/src/components/features/event/
  -   - [ ] Display key event information: image, title, date/time, location, price range
  -   - [ ] Implement responsive design for mobile/tablet/desktop breakpoints
  -   - [ ] Integrate EventCard components in responsive grid/list layout
  -   - [ ] Follow UI/UX guidelines for spacing and layout
  -   - [ ] Create Pagination.tsx in apps/client/src/components/ui/
  -   - [ ] Support page numbers, previous/next navigation
  -   - [ ] Create app/(tabs)/events.tsx route file
  - From Story 2.4 completion: Event status management is fully functional with published events properly filtered. API patterns established for event endpoints with proper authorization. UI/UX guidelines being followed with Chakra UI components and responsive design patterns.

### 2.6.story.md
**Story 2.6: Organizer Dashboard Migration**

頁面/路由：
  - 4. Charts/graphs are styled consistently with React Native Elements theme
  -   - [x] Apply theme system from theme/index.ts throughout
  -   - [x] Add navigation to event details/management
  -   - [x] Update app/organizer/dashboard.tsx to use new dashboard component
  -   - [x] Create filter dropdown using React Native Elements Overlay/BottomSheet
  - - Theme system fully configured at `apps/client/src/theme/index.ts`
  - - Traditional Chinese localization structure in place at `apps/client/src/localization/locales/zh-TW.json`
  - - Mock patterns for @rneui/themed components defined
  - **CRITICAL**: The organizer dashboard currently uses **Chakra UI** (`@chakra-ui/react`), NOT React Native Elements. Complete migration required.
  - - `apps/client/src/components/features/organizer/OrganizerDashboard.tsx` - Uses Chakra UI extensively

### 3.1.story.md
**Story 3.1: Discount Code Management**

頁面/路由：
  -   - [x] Add POST /events/{eventId}/discount-codes endpoint for creating discount codes
  -   - [x] Add GET /events/{eventId}/discount-codes endpoint for listing discount codes
  -   - [x] Add PUT /events/{eventId}/discount-codes/{codeId} endpoint for updating discount codes
  -   - [x] Add DELETE /events/{eventId}/discount-codes/{codeId} endpoint for deleting discount codes
  -   - [x] Follow UI/UX guidelines for spacing and layout
  - Backend Technologies [Source: architecture/tech-stack.md]:
  - Frontend Technologies [Source: architecture/tech-stack.md]:
  - DiscountCode Entity [Source: architecture/data-models.md]:
  - Event Entity [Source: architecture/data-models.md]:
  - Discount Codes Table [Source: architecture/database-schema.md]:

### 3.2.story.md
**Story 3.2: Registration Form - Ticket Selection**

頁面/路由：
  -   - [x] Add GET /events/{eventId}/ticket-types endpoint to fetch available ticket types with remaining quantities
  -   - [x] Follow Chakra UI design system and UI/UX guidelines from docs/UIUX
  -   - [x] Add "Register" button to EventCard/EventDetails components
  -   - [x] Follow responsive design patterns from docs/UIUX/responsiveness-strategy.md
  - Backend Technologies [Source: architecture/tech-stack.md]:
  - Frontend Technologies [Source: architecture/tech-stack.md]:
  - TicketType Entity [Source: architecture/data-models.md]:
  - Event Entity [Source: architecture/data-models.md]:  
  - Endpoint Patterns [Source: architecture/frontend-architecture.md]:
  - - Base path: `/api/v1`

### 3.3.story.md
**Story 3.3: Registration Form - Custom Fields & Discount Code**

頁面/路由：
  -   - [x] Add GET /events/{eventId}/registration-fields endpoint
  -   - [x] Add POST /events/{eventId}/validate-discount endpoint
  -   - [x] Follow Chakra UI design system and UI/UX guidelines from docs/UIUX
  -   - [x] Follow responsive design patterns from docs/UIUX/responsiveness-strategy.md
  - Backend Technologies [Source: architecture/tech-stack.md]:
  - Frontend Technologies [Source: architecture/tech-stack.md]:
  - Custom Registration Field Entity (to be created) [Source: docs/prd/requirements.md - FR-4.4]:
  - DiscountCode Entity [Source: architecture/data-models.md]:
  - - GET /api/v1/events/{eventId}/registration-fields (fetch custom fields for event)
  - - POST /api/v1/events/{eventId}/validate-discount (validate discount code and return updated pricing)

### 3.4.story.md
**Story 3.4: Payment Gateway Service (ECPay Implementation)**

頁面/路由：
  -   - [x] Define unified payment request/response schemas
  -   - [x] Update shared types in packages/shared-types
  -   - [x] Add POST /api/v1/payments/initiate endpoint (provider-agnostic)
  -   - [x] Add POST /api/v1/payments/callback/{providerId}/{organizerId} endpoint
  -   - [x] Add GET /api/v1/payments/{paymentId}/status endpoint
  -   - [x] Add GET/POST /api/v1/organizers/me/payment-providers endpoints
  -   - [x] Create PaymentStatusPage.tsx for success/failure handling
  -   - [x] Follow Chakra UI design system and UI/UX guidelines from docs/UIUX
  -   - [x] Follow responsive design patterns from docs/UIUX/responsiveness-strategy.md
  - **CRITICAL**: Found existing payment service implementations in `docs/temp/` that provide proven patterns:

### 3.5.story.md
**Story 3.5: Registration Confirmation & Ticket Generation**

頁面/路由：
  - 5. The new ticket(s) appear in the "My Registrations/Tickets" section of the user's dashboard.
  -   - [x] Implement responsive design following docs/UIUX guidelines
  -   - [x] Implement ticket download functionality (PDF/image)
  - - Payment entities: `apps/server/src/features/payments/entities/`
  - - PaymentGatewayService: `apps/server/src/features/payments/services/payment-gateway.service.ts`
  - - Frontend payment components: `apps/client/src/components/features/event/`
  - [Source: architecture/tech-stack.md]
  - - **CRITICAL**: Frontend must follow all guides in docs/UIUX directory
  - [Source: architecture/data-models.md]
  - [Source: architecture/external-apis.md]

### 3.6.story.md
**Story 3.6: Attendee Management for Organizers**

頁面/路由：
  -   - [x] Add GET /api/v1/events/{eventId}/attendees endpoint with filtering support
  -   - [x] Add GET /api/v1/events/{eventId}/attendees/export endpoint for CSV/Excel download
  -   - [x] Follow all guides in docs/UIUX directory for responsive design and accessibility
  -   - [x] Add export button with CSV/Excel format options
  -   - [x] Add "Manage Attendees" link/button to event cards in organizer dashboard
  -   - [x] Create route /organizer/events/{eventId}/attendees
  -   - [x] Unit tests for AttendeeExportService with CSV/Excel generation
  - - Registration entities and services: `apps/server/src/features/registrations/`
  - - User dashboard components: `apps/client/src/components/features/user/`
  - [Source: architecture/tech-stack.md]

### 3.7.story.md
**Story 3.7: Platform Admin Dashboard**

頁面/路由：
  -   - [x] Create `/app/admin/_layout.tsx` with drawer navigation structure
  -   - [x] Create `/app/admin/users.tsx` for user listing
  -   - [x] Add actions: view details, suspend/activate, delete
  -   - [x] Create `/app/admin/dashboard.tsx` with statistics overview
  -   - [x] Create `/app/admin/system-health.tsx` screen
  -   - [x] Implement for user suspension/deletion actions
  -   - [x] Implement for event unpublishing/deletion actions
  -   - [x] Include success/error toast notifications
  - [Source: docs/current/architecture/5-元件架構-component-architecture.md]
  - - Admin components should be placed in `components/features/admin/` directory

### 3.8.story.md
**Story 3.8: Export & Reporting Features**

頁面/路由：
  - 2. Format selection uses React Native Elements ButtonGroup (CSV/Excel/PDF)
  -   - [x] Add select all/deselect all functionality
  -   - [x] Add format icons using @expo/vector-icons
  -   - [x] Implement delete/clear history options
  -   - [x] Update `/app/organizer/reports.tsx` with new export components
  - [Source: docs/current/architecture/5-元件架構-component-architecture.md]
  - - Export components should be placed in `components/features/organizer/` directory
  - - Reusable UI components in `components/atoms/` and `components/molecules/`
  - [Source: docs/current/architecture/6-源碼樹整合-source-tree-integration.md]
  - apps/client/src/

### 4.1.story.md
**Story 4.1: Organizer Check-in Mode**

頁面/路由：
  -   - [x] Follow all guides in docs/UIUX directory for responsive design and accessibility
  -   - [x] Add check-in mode route /organizer/events/{eventId}/checkin
  -   - [x] Add camera switching functionality (front/back camera)
  - - QR code generation service: `apps/server/src/features/registrations/services/qr-code.service.ts`
  - - User dashboard components: `apps/client/src/components/features/user/MyTicketsPage.tsx`
  - [Source: architecture/tech-stack.md]
  - - **CRITICAL**: Frontend must follow all guides in docs/UIUX directory
  - [Source: architecture/data-models.md]
  - [Source: architecture/unified-project-structure.md]
  - apps/client/src/

### 4.2.story.md
**Story 4.2: QR Code Scanning & Validation**

頁面/路由：
  -   - [x] Add POST /api/v1/events/{eventId}/checkin endpoint
  -   - [x] Follow all guides in docs/UIUX directory for consistent design
  - - CameraScanner component: `apps/client/src/components/features/organizer/CameraScanner.tsx`
  - - Camera service with QR processing: `apps/client/src/services/cameraService.ts`
  - - QR code generation service: `apps/server/src/features/registrations/services/qr-code.service.ts`
  - - CheckInModeScreen with real-time statistics: `apps/client/src/components/features/organizer/CheckInModeScreen.tsx`
  - [Source: architecture/tech-stack.md]
  - - **CRITICAL**: Frontend must follow all guides in docs/UIUX directory
  - [Source: architecture/data-models.md]
  - [Source: architecture/api-specification.md]

### 4.3.story.md
**Story 4.3: Manual Attendee Search & Check-in**

頁面/路由：
  -   - [x] Add search button/toggle to switch between QR scanning and manual search modes
  -   - [x] Design and implement search input component for name/registration number
  -   - [x] Follow all guides in docs/UIUX directory for consistent design
  -   - [x] Create GET /api/v1/events/{eventId}/attendees/search endpoint
  -   - [x] Add search functionality by registration number/ID
  -   - [x] Include registration number/ID in search results for verification
  -   - [x] Use existing success/error modals for feedback
  - - CheckInModeScreen: `apps/client/src/components/features/organizer/CheckInModeScreen.tsx`
  - - CheckIn service: `apps/client/src/services/checkinService.ts` 
  - - CheckIn API endpoint: POST /api/v1/events/{eventId}/checkin

### 4.4.story.md
**Story 4.4: Check-in Dashboard & Statistics**

頁面/路由：
  -   - [x] Follow all guides in docs/UIUX directory for consistent design
  -   - [x] Create GET /api/v1/events/{eventId}/statistics endpoint  
  - - CheckInModeScreen: `apps/client/src/components/features/organizer/CheckInModeScreen.tsx`
  - - CheckIn service: `apps/client/src/services/checkinService.ts`
  - - CheckIn API endpoint: POST /api/v1/events/{eventId}/checkin
  - - Success/Error modals and feedback systems are established
  - [Source: architecture/tech-stack.md]
  - - **CRITICAL**: Frontend must follow all guides in docs/UIUX directory
  - [Source: architecture/data-models.md]
  - [Source: architecture/api-specification.md]

### 4.5.story.md
**Story 4.5: Post-Event Reporting**

頁面/路由：
  -   - [x] Create GET /api/v1/events/{eventId}/report endpoint for comprehensive event metrics
  -   - [x] Create GET /api/v1/events/{eventId}/report/export endpoint
  -   - [x] Create CRUD endpoints for invoice settings (/api/v1/events/{eventId}/invoice-settings)
  -   - [x] Follow all guides in docs/UIUX directory for consistent design
  - - Event statistics infrastructure already exists: GET /api/v1/events/{eventId}/statistics
  - - EventStatisticsService is available at `apps/server/src/features/events/services/event-statistics.service.ts`
  - - OrganizerDashboard exists at `apps/client/src/components/features/organizer/OrganizerDashboard.tsx`
  - [Source: architecture/tech-stack.md]
  - - **CRITICAL**: Frontend must follow all guides in docs/UIUX directory
  - [Source: architecture/data-models.md]

### 4.6.story.md
**Story 4.6: Final Localization Review**

頁面/路由：
  - 2. Ensure date/time formats follow Taiwan conventions
  - - [x] Task 2: Date/Time Localization (AC: 2)
  -   - [x] Implement correct time format (24-hour vs AM/PM preferences)
  -   - [x] Review event/ticket counting terminology
  - [Source: docs/current/architecture/3-技術棧對齊-tech-stack-alignment.md]
  - [Source: docs/current/architecture/6-源碼樹整合-source-tree-integration.md]
  - apps/client/src/
  -   short: 'YYYY/MM/DD',           // 2025/01/11
  -     verbs: '可以',      // Can/able to
  - - Admin/organizer interface

### 4.7.story.md
**Story 4.7: Testing & Quality Assurance**

頁面/路由：
  -   - [x] Audit all existing component tests in `apps/client/src/components/`
  -   - [x] Update test utilities in `apps/client/src/test-utils/` for React Native Elements
  -   - [x] Verify test coverage for all atomic components in `components/atoms/`
  -   - [x] Verify test coverage for all molecular components in `components/molecules/`
  -   - [x] Verify test coverage for all organism components in `components/organisms/`
  -   - [x] Create integration test for user authentication flow (login/register/password reset)
  -   - [x] Update all service tests in `apps/client/src/services/` to handle new UI patterns
  -   - [x] Identify components/services with low coverage
  -   - [x] Configure test reporting for CI/CD pipeline
  - - Component tests: `apps/client/src/components/**/*.spec.tsx`

### 4.8.story.md
**Story 4.8: Migration Documentation & Handoff**

頁面/路由：
  -   - [x] Include before/after code snippets
  -   - [x] Document i18n/i18next setup and configuration
  -   - [x] Include date/time/currency formatting guidelines
  -   - [x] Update docs/migration/migration-log.md with final status
  -   - [x] Complete docs/migration/compatibility-checklist.md
  - - Created testing best practices documentation (docs/testing-best-practices.md)
  - - UAT test plan documented (docs/uat-test-plan.md)
  - - Known issues documented (docs/known-issues.md)
  - [Source: docs/README.md]
  - - `/docs/current/` - Current version docs (React Native Elements)

### 5.1.story.md
**Story 5.1: Frontend Architecture Unification and Cleanup**

頁面/路由：
  - - Updated test mocks to use @react-navigation/native
  - - Fixed EventManagement.tsx - major rewrite with Tab/TabView implementation
  - - apps/client/src/components/features/organizer/AttendeeManagementPage.tsx (modified)
  - - apps/client/src/components/features/organizer/CheckInModeScreen.tsx (completely rewritten)
  - - apps/client/src/components/features/organizer/CameraScanner.tsx (completely rewritten)
  - - apps/client/src/components/features/organizer/CheckInSuccessModal.tsx (completely rewritten)
  - - apps/client/src/components/features/organizer/CheckInErrorModal.tsx (completely rewritten)
  - - apps/client/src/components/features/organizer/AttendeeSearchForm.tsx (completely rewritten)
  - - apps/client/src/components/features/organizer/AttendeeSearchResults.tsx (completely rewritten)
  - - apps/client/src/components/features/organizer/EventAnalyticsScreen.tsx (modified)

### 5.2.story.md
**Story 5.2: Frontend Deployment to Zeabur**

頁面/路由：
  - 4. All API endpoints correctly connect to the existing backend at `https://jctop.zeabur.app/api/v1`.
  - 5. Authentication flow works end-to-end (login/register/logout functionality).
  - 10. SSL/HTTPS is properly configured for secure access (handled automatically by Zeabur).
  -   - Use `${...}` syntax for inter-service references (e.g., `EXPO_PUBLIC_API_URL: https://${backend-api.ZEABUR_WEB_URL}/api/v1`)
  - - [x] **Install/Update CLI**: Ensure the latest Zeabur CLI is available via `npx zeabur@latest`
  - - **UI Components:** @rneui/base and @rneui/themed (React Native Elements)
  - - **Icons:** @expo/vector-icons
  - - API available at: `https://jctop.zeabur.app/api/v1`
  - /home/golfamigo/projects/JCTOPV2/
  - **Frontend Build Location:** `/apps/client/`

