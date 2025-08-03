# Epic 3: Event Registration & Payment
**Epic Goal:** To provide attendees with a seamless and secure end-to-end registration and payment experience. This epic also equips organizers with the necessary tools to manage incoming registrations and offer promotions, directly enabling the platform's core business function.

### Story 3.1: Discount Code Management
[cite_start]**As an** event organizer, **I want** to create and manage discount codes, **so that** I can offer promotions and track their effectiveness. [cite: 6]
**Acceptance Criteria:**
1.  [cite_start]A section in the organizer dashboard allows for creating discount codes with a specific name, type (e.g., percentage, fixed amount), value, and expiration date[cite: 6].
2.  [cite_start]The system tracks the number of times each discount code has been used[cite: 6].
3.  An organizer can view a list of all created codes and their usage statistics.

### Story 3.2: Registration Form - Ticket Selection
[cite_start]**As an** attendee, **I want** to select the type and quantity of tickets I wish to purchase for an event, **so that** I can begin the registration process. [cite: 6]
**Acceptance Criteria:**
1.  On the event detail page, a "Register" button initiates the registration flow.
2.  [cite_start]The user is presented with a clear interface showing available ticket types, prices, and remaining quantities[cite: 6].
3.  [cite_start]The user can select the desired quantity for each ticket type[cite: 6].
4.  The system validates that the selected quantity does not exceed the remaining available tickets.

### Story 3.3: Registration Form - Custom Fields & Discount Code
[cite_start]**As an** attendee, **I want** to fill out any required information and apply a discount code, **so that** I can complete my registration details. [cite: 6]
**Acceptance Criteria:**
1.  [cite_start]The registration form dynamically displays any custom fields the organizer has configured for the event[cite: 6].
2.  [cite_start]A field is available for entering a discount code[cite: 6].
3.  When a valid discount code is applied, the total price is updated correctly and displayed to the user.
4.  An invalid or expired discount code displays a clear error message.

### Story 3.4: Payment Gateway Service (ECPay Implementation)
[cite_start]**As a** platform developer, **I want** to build a reusable Payment Gateway Service with ECPay as the first provider, **so that** the platform can process payments for any feature and easily add new payment providers in the future. [cite: 6]
**Acceptance Criteria:**
1.  Create a Payment Gateway Service that abstracts payment provider implementations.
2.  Implement ECPay as the first payment provider within the gateway service.
3.  Organizers can configure their payment provider credentials (ECPay initially) in their dashboard.
4.  The service uses organizer-specific credentials for processing payments for their resources.
5.  [cite_start]The service provides a unified API that can be called by any platform feature (events, subscriptions, marketplace)[cite: 6].
6.  The service correctly handles successful and failed payment callbacks from any provider.
7.  Payment provider implementations are pluggable - new providers can be added without changing the core service.
8.  Payments are isolated per organizer regardless of payment provider used.

**Note:** This implements a service-oriented Payment Gateway architecture where each organizer (主辦方) can configure their preferred payment provider. The service supports multiple providers (ECPay initially, with future support for Stripe, PayPal, etc.) and can be reused across all platform features, ensuring complete financial isolation between organizers.

### Story 3.5: Registration Confirmation & Ticket Generation
[cite_start]**As an** attendee, **I want** to receive a confirmation and a digital ticket after a successful payment, **so that** I have proof of registration. [cite: 6]
**Acceptance Criteria:**
1.  Upon successful payment, a registration record is created in the database.
2.  A unique QR code is generated for each ticket purchased.
3.  [cite_start]The user is shown a confirmation page summarizing their registration details[cite: 6].
4.  [cite_start]A confirmation email, including ticket details and the QR code, is sent to the user's email address[cite: 6].
5.  [cite_start]The new ticket(s) appear in the "My Registrations/Tickets" section of the user's dashboard[cite: 6].

### Story 3.6: Attendee Management for Organizers
[cite_start]**As an** event organizer, **I want** to view and manage the list of attendees for my event, **so that** I can track registration progress and have a record of participants. [cite: 6]
**Acceptance Criteria:**
1.  [cite_start]A section in the organizer dashboard displays a detailed list of all registered attendees for a specific event[cite: 6].
2.  [cite_start]The list includes attendee information from the registration form, payment status, and ticket details[cite: 6].
3.  [cite_start]The organizer can filter the list by payment status (e.g., paid, pending)[cite: 6].
4.  [cite_start]The organizer can export the attendee list to a CSV or Excel file[cite: 6].
