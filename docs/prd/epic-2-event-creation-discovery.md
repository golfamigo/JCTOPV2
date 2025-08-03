# Epic 2: Event Creation & Discovery
**Epic Goal:** To empower event organizers with the tools to create, define, and manage their events through a user-friendly interface. This epic will also deliver the core Browse experience for attendees, allowing them to easily discover, search, filter, and view detailed information for all public events on the platform.

### Story 2.1: Event Data Model & Database Migration
**As a** developer, **I want** to define the `Event` data model and related database tables, **so that** all necessary event information can be stored and managed.
**Acceptance Criteria:**
1.  An `Event` model is defined with fields for title, description, dates, location, status, organizer ID, etc.
2.  Models for `Category`, `Venue`, and `TicketType` are created and linked to the `Event` model.
3.  A database migration script is created that successfully generates the corresponding tables and relationships.

### Story 2.2: Basic Event Creation Form
[cite_start]**As an** event organizer, **I want** a simple form to input the basic details of a new event (title, description, date, time, location), **so that** I can create a draft of my event. [cite: 6]
**Acceptance Criteria:**
1.  A new route and page for event creation are available to logged-in organizers.
2.  The form includes input fields for all basic event information.
3.  Submitting the form creates a new event record in the database with a "draft" status.
4.  The event is correctly associated with the logged-in organizer.

### Story 2.3: Event Ticket & Seating Configuration
[cite_start]**As an** event organizer, **I want** to define ticket types and seating arrangements for my event, **so that** I can manage sales and capacity. [cite: 6]
**Acceptance Criteria:**
1.  Within the event creation flow, an organizer can add multiple ticket types (e.g., VIP, General Admission) with names, prices, and quantities.
2.  [cite_start]An organizer can define basic seating areas/zones for the venue. [cite: 6]
3.  The configured ticket and seating information is saved and associated with the correct event.

### Story 2.4: Event Publishing & Status Management
[cite_start]**As an** event organizer, **I want** to publish a draft event to make it live, and later be able to unpublish it or pause registrations, **so that** I have full control over my event's visibility. [cite: 6]
**Acceptance Criteria:**
1.  An organizer can change an event's status from "draft" to "published".
2.  Only "published" events are visible to the public.
3.  An organizer can change a "published" event's status to "unpublished" (hiding it) or "paused" (visible but registration is closed).

### Story 2.5: Public Event List & Discovery Page
[cite_start]**As an** attendee, **I want** to view a list of all available events, **so that** I can discover activities I'm interested in. [cite: 6]
**Acceptance Criteria:**
1.  An API endpoint exists to fetch all "published" events.
2.  [cite_start]A public page displays events in a card-style list, showing key information (image, title, date, price)[cite: 6].
3.  [cite_start]The event list is paginated to handle a large number of events efficiently[cite: 6].

### Story 2.6: Event Search, Filtering, and Sorting
[cite_start]**As an** attendee, **I want** to search, filter, and sort the event list, **so that** I can quickly find events that match my specific criteria. [cite: 6]
**Acceptance Criteria:**
1.  [cite_start]A keyword search input is available that filters the event list by title and description[cite: 6].
2.  [cite_start]Filtering options are available for category, date range, location, and price[cite: 6].
3.  [cite_start]Sorting options are available for popularity, date, and price[cite: 6].
4.  The search, filter, and sort functionalities work together and update the event list correctly.

### Story 2.7: Event Detail Page
[cite_start]**As an** attendee, **I want** to view a detailed page for a specific event, **so that** I can get all the information I need before registering. [cite: 6]
**Acceptance Criteria:**
1.  Clicking an event card navigates to a unique URL for that event's detail page.
2.  [cite_start]The page displays comprehensive event information, including full description, date/time, and an integrated map for the location[cite: 6].
3.  [cite_start]The page shows the real-time number of remaining tickets for each ticket type[cite: 6].
4.  [cite_start]Social media sharing buttons (e.g., for Facebook, LINE) are present and functional[cite: 6].

### Story 2.8: User 'My Favorites' Functionality
[cite_start]**As an** attendee, **I want** to save events to a "Favorites" list, **so that** I can easily find them later. [cite: 6]
**Acceptance Criteria:**
1.  A logged-in user can add or remove an event from their favorites from the event list or detail page.
2.  A "My Favorites" section in the user's dashboard displays a list of their saved events.
3.  The favorite status of an event is persistent for the user across sessions.
