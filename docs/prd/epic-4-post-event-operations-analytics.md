# Epic 4: Post-Event Operations & Analytics
**Epic Goal:** To provide organizers with the essential tools for managing event-day operations, specifically a robust in-app check-in system. Furthermore, this epic will deliver data analytics and reporting features, empowering organizers to measure the success of their events and make data-driven decisions for the future.

### Story 4.1: Organizer Check-in Mode
[cite_start]**As an** event organizer, **I want** to switch my app to a "Check-in Mode", **so that** I can use my device to scan tickets at the venue entrance. [cite: 6]
**Acceptance Criteria:**
1.  [cite_start]A logged-in organizer can select one of their upcoming or active events and enter a dedicated "Check-in Mode"[cite: 6].
2.  The check-in interface is simple, with a large viewfinder for the camera and clear on-screen instructions.
3.  The app requests and correctly utilizes camera permissions for scanning.

### Story 4.2: QR Code Scanning & Validation
[cite_start]**As an** event organizer, **I want** to scan an attendee's QR code to validate their ticket instantly, **so that** the check-in process is fast and efficient. [cite: 6]
**Acceptance Criteria:**
1.  [cite_start]The in-app scanner correctly reads the QR codes generated for tickets[cite: 6].
2.  Upon a successful scan of a valid ticket, the screen displays a clear "Success" message with attendee details (e.g., name, ticket type).
3.  [cite_start]The system prevents the same ticket from being checked in more than once, showing a clear "Already Checked In" error[cite: 6].
4.  Scanning an invalid or non-existent QR code results in a "Ticket Not Found" error.
5.  [cite_start]Each successful scan updates the attendee's status to "checked-in" in the database in real-time[cite: 6].

### Story 4.3: Manual Attendee Search & Check-in
[cite_start]**As an** event organizer, **I want** a manual lookup option, **so that** I can check in attendees who may have forgotten or are unable to display their QR code. [cite: 6]
**Acceptance Criteria:**
1.  Within the "Check-in Mode", there is an option to search for attendees manually.
2.  [cite_start]The organizer can search by name or registration number[cite: 6].
3.  The search results display matching attendees and their current check-in status.
4.  The organizer can select an attendee from the search results and manually mark them as "checked-in".

### Story 4.4: Check-in Dashboard & Statistics
[cite_start]**As an** event organizer, **I want** to see real-time check-in statistics during my event, **so that** I can monitor attendance flow. [cite: 6]
**Acceptance Criteria:**
1.  [cite_start]The "Check-in Mode" displays a live counter of total checked-in attendees versus total registered attendees[cite: 6].
2.  [cite_start]The main organizer dashboard also reflects the real-time check-in and attendance rates[cite: 6].

### Story 4.5: Post-Event Reporting
[cite_start]**As an** event organizer, **I want** to view and export a final report after my event concludes, **so that** I can analyze its success. [cite: 6]
**Acceptance Criteria:**
1.  An analytics section in the organizer dashboard provides reports for past events.
2.  [cite_start]The report includes final numbers for registrations, sales revenue, and attendance rates[cite: 6].
3.  [cite_start]The organizer can export the summary report[cite: 6].
4.  [cite_start]The system provides an interface for managing invoice generation settings for events[cite: 6].

***