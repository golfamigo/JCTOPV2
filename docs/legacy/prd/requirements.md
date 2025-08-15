# Requirements

### Functional Requirements

**User-Facing (Frontend)**
* **FR-1**: **Event Browse and Discovery**
    * [cite_start]FR-1.1: Display events in a card-style list showing main image, title, date, location, price, and registration status[cite: 6].
    * [cite_start]FR-1.2: Provide keyword search functionality[cite: 6].
    * [cite_start]FR-1.3: Offer multi-dimensional filtering by date, category, location, and price[cite: 6].
    * [cite_start]FR-1.4: Provide sorting options by popularity, latest, date, and price[cite: 6].
    * [cite_start]FR-1.5: Implement pagination/lazy loading for performance[cite: 6].
* **FR-2**: **Event Detail Page**
    * [cite_start]FR-2.1: Display complete event information: title, description, date, time, and location (with map integration)[cite: 6].
    * [cite_start]FR-2.2: Show real-time remaining ticket counts and venue/seat maps[cite: 6].
    * [cite_start]FR-2.3: Provide social media sharing buttons (Facebook, LINE, Instagram)[cite: 6].
* **FR-3**: **User Account Management**
    * [cite_start]FR-3.1: Support registration and login via Email/Password[cite: 6].
    * [cite_start]FR-3.2: Support third-party login (Apple ID, Google, LINE)[cite: 6].
    * [cite_start]FR-3.3: Provide a "forgot/reset password" flow[cite: 6].
    * [cite_start]FR-3.4: Allow users to manage their personal profile (name, phone, email)[cite: 6].
    * [cite_start]FR-3.5: "My Registrations/Tickets" page showing registered events, QR Codes, and seat numbers[cite: 6].
    * [cite_start]FR-3.6: "My Favorites" feature for users to save events of interest[cite: 6].
* **FR-4**: **Event Registration Flow**
    * FR-4.1: Provide an interface for ticket/seat selection, including basic zone selection and a list-based view with seat details. [cite_start]The system will auto-assign seat numbers[cite: 6].
    * [cite_start]FR-4.2: Allow selection of ticket quantity[cite: 6].
    * [cite_start]FR-4.3: Provide a discount code input field with validation[cite: 6].
    * [cite_start]FR-4.4: Support custom registration form fields defined by the organizer[cite: 6].
    * [cite_start]FR-4.5: Integrate multiple payment gateways (e.g., Credit Card, ATM Transfer, Convenience Store)[cite: 6].
    * [cite_start]FR-4.6: Display a confirmation page and send a confirmation email upon successful registration[cite: 6].

**Organizer/Admin (Backend)**
* **FR-5**: **Event Management Dashboard**
    * [cite_start]FR-5.1: Display core statistics: total events, total registrations, check-in rate, total revenue[cite: 6].
    * [cite_start]FR-5.2: Provide an event list management view with filtering by status (draft, published, ended)[cite: 6].
* **FR-6**: **Event Management**
    * [cite_start]FR-6.1: A multi-step wizard for creating new events (basic info, details, ticketing/seating, publishing)[cite: 6].
    * [cite_start]FR-6.2: Support for editing, updating, cloning, and deleting existing events[cite: 6].
    * [cite_start]FR-6.3: Allow management of event status (publish/unpublish, pause registration)[cite: 6].
* **FR-7**: **Discount Code Management**
    * [cite_start]FR-7.1: Create and manage discount codes (code, type, scope, expiration)[cite: 6].
    * [cite_start]FR-7.2: Track usage of discount codes[cite: 6].
* **FR-8**: **Attendee Management**
    * [cite_start]FR-8.1: View a detailed list of attendees with their registration data[cite: 6].
    * [cite_start]FR-8.2: Support exporting attendee data (CSV, Excel)[cite: 6].
    * [cite_start]FR-8.3: Manage registration status (paid, pending, cancelled)[cite: 6].
* **FR-9**: **Check-in & Validation System (In-App)**
    * [cite_start]FR-9.1: Organizer mode within the app for scanning QR codes for check-in[cite: 6].
    * [cite_start]FR-9.2: Support for manual check-in by searching for attendee name or number[cite: 6].
    * [cite_start]FR-9.3: Real-time check-in status display and duplicate check-in prevention[cite: 6].
* **FR-10**: **Data Analytics & Reporting**
    * [cite_start]FR-10.1: Provide detailed reports on registration statistics, sales, and attendance rates[cite: 6].
    * [cite_start]FR-10.2: Invoice generation and reporting, with an option to enable/disable (enabled by default), integrated with ECPay[cite: 6].
* **FR-11**: **System Settings**
    * [cite_start]FR-11.1: ECPay payment gateway integration settings (API Key, Hash)[cite: 6].
    * [cite_start]FR-11.2: Customizable notification templates (e.g., registration confirmation, event reminder)[cite: 6].
    * [cite_start]FR-11.3: Event category management (add, edit, delete)[cite: 6].

### Non-Functional Requirements
* **NFR-1**: **Performance**
    * [cite_start]NFR-1.1: Core pages (event list, detail page) must load within 3 seconds[cite: 7].
    * [cite_start]NFR-1.2: Key API responses should be under 500ms[cite: 7].
    * [cite_start]NFR-1.3: System must support at least 1000 concurrent users during registration without performance degradation[cite: 7].
* **NFR-2**: **Security**
    * [cite_start]NFR-2.1: All data transfer must be encrypted via HTTPS/SSL[cite: 7].
    * [cite_start]NFR-2.2: Sensitive data (like payment credentials) must be encrypted at rest[cite: 7].
    * [cite_start]NFR-2.3: Implement strong password policies and MFA[cite: 7].
    * [cite_start]NFR-2.4: Protect against common web vulnerabilities (SQL Injection, XSS, CSRF)[cite: 7].
    * [cite_start]NFR-2.5: Comply with relevant data protection laws (e.g., GDPR, Personal Data Protection Act)[cite: 7].
* **NFR-3**: **Reliability**
    * [cite_start]NFR-3.1: Target system availability of 99.9%[cite: 7].
    * [cite_start]NFR-3.2: Implement data backup and recovery mechanisms[cite: 7].
    * [cite_start]NFR-3.3: Ensure proper error handling and logging[cite: 7].
* **NFR-4**: **Scalability**
    * [cite_start]NFR-4.1: Architecture must support horizontal scaling to handle future growth[cite: 7].
    * [cite_start]NFR-4.2: Design must be modular to facilitate future feature expansion[cite: 7].
* **NFR-5**: **Usability**
    * [cite_start]NFR-5.1: The interface must be intuitive, clean, and follow modern UI/UX conventions[cite: 7].
    * [cite_start]NFR-5.2: User flows must be clear to minimize the learning curve[cite: 7].
* **NFR-6**: **Maintainability**
    * [cite_start]NFR-6.1: Code must adhere to defined standards with proper commenting[cite: 7].
    * [cite_start]NFR-6.2: Include automated tests to ensure stability[cite: 7].
