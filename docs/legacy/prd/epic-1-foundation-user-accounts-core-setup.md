# Epic 1: Foundation, User Accounts & Core Setup
**Epic Goal:** To establish the project's complete technical foundation, including a scalable monorepo structure, initial CI/CD pipeline, and a verifiable connection to the database. This epic will also deliver the first piece of tangible user value: a complete, secure user account system allowing users to register, log in, manage their profiles, and reset their passwords.

### Story 1.1: Project Scaffolding
**As a** development team, **I want** to set up the monorepo structure with initialized frontend (Expo) and backend applications, **so that** we have a clean, organized foundation for concurrent development.
**Acceptance Criteria:**
1.  A monorepo is initialized with appropriate tooling (e.g., npm workspaces, Turborepo).
2.  An Expo application is created within the monorepo (`apps/client`).
3.  A basic Node.js backend application is created within the monorepo (`apps/server`).
4.  Shared packages for common code (e.g., `packages/shared-types`) are created.
5.  Root `package.json` scripts are configured to run/build/test each application.

### Story 1.2: Database & Core Service Setup
**As a** developer, **I want** to establish a connection to the PostgreSQL database from the backend service and create a health-check endpoint, **so that** the core backend infrastructure is stable and verifiable.
**Acceptance Criteria:**
1.  Backend service successfully connects to the PostgreSQL database on startup.
2.  A `/health` API endpoint is created.
3.  When the `/health` endpoint is called, it returns a `200 OK` status if the database connection is active.

### Story 1.3: User Model & Database Migration
**As a** developer, **I want** to define the `User` data model and create the initial database migration, **so that** user account information can be stored securely and consistently.
**Acceptance Criteria:**
1.  A `User` model is defined with fields for name, email, password hash, and timestamps.
2.  A database migration script is created to generate the `users` table.
3.  The migration script runs successfully against the database.

### Story 1.4: Email & Password Registration
[cite_start]**As a** new user, **I want** to register for an account using my email and a password, **so that** I can access the platform's features. [cite: 6]
**Acceptance Criteria:**
1.  A registration form with "Name", "Email", and "Password" fields is available.
2.  The registration API endpoint validates input (e.g., email format, password strength).
3.  The API checks for existing users to prevent duplicate emails.
4.  Passwords are securely hashed before being stored in the database.
5.  A new user record is created in the `users` table upon successful registration.

### Story 1.5: User Login & Session Management
[cite_start]**As a** registered user, **I want** to log in with my email and password, **so that** I can access my account. [cite: 6]
**Acceptance Criteria:**
1.  A login form with "Email" and "Password" fields is available.
2.  The login API endpoint validates the provided credentials against the stored hashed password.
3.  A secure session token (e.g., JWT) is generated and returned upon successful login.
4.  The session token is securely stored on the client-side.
5.  Authenticated routes are protected and require a valid session token.

### Story 1.6: User Profile Management
[cite_start]**As a** logged-in user, **I want** to view and update my profile information (e.g., name, phone number), **so that** my personal details remain accurate. [cite: 6]
**Acceptance Criteria:**
1.  A user profile page displays the current user's information.
2.  The user can edit their profile information in a form.
3.  The update API endpoint successfully saves the changes to the user's record in the database.

### Story 1.7: Third-Party Login (Google)
[cite_start]**As a** new or existing user, **I want** to sign in using my Google account, **so that** I can access the platform quickly without needing a separate password. [cite: 6]
**Acceptance Criteria:**
1.  A "Sign in with Google" button is present on the login/registration page.
2.  The application correctly implements the OAuth 2.0 flow with Google.
3.  Upon successful authentication with Google, a new user is created in the database if they don't exist.
4.  An existing user is correctly identified and logged in.
5.  A valid session token is issued to the user.

### Story 1.8: Password Reset Flow
[cite_start]**As a** user who has forgotten my password, **I want** to request a password reset link via email, **so that** I can regain access to my account. [cite: 6]
**Acceptance Criteria:**
1.  A "Forgot Password" link is available on the login page.
2.  The user can submit their email address to receive a reset link.
3.  A unique, time-limited password reset token is generated and sent to the user's email.
4.  The link in the email directs the user to a secure form to enter and confirm a new password.
5.  The user's password hash is updated in the database.
