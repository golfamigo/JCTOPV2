# User Flows

  * **Attendee Event Registration & Purchase**

      * **User Goal**: To find a specific event and successfully purchase a ticket.
      * **Flow Diagram**
        ```mermaid
        graph TD
            A[Start: User on Homepage] --> B{User Authenticated?};
            B -->|No| C[Redirect to Login/Register];
            C --> D[User logs in];
            
            subgraph "Login Redirect Logic"
              direction LR
              D -- "From Event Details?" --> F;
              D -- "Default" --> E;
            end

            B -->|Yes| E[User finds event on Event List Page];
            E --> F[Views Event Details Page];
            F --> G[Clicks "Register"];
            G --> H[Selects Ticket Type & Quantity];
            H --> I[Fills out Registration Form];
            I --> J[Applies Discount Code (Optional)];
            J --> K[Enter/Edit Payment Information];
            K --> L[Submits Payment via ECPay];
            L --> M{Payment Successful?};
            M -->|Yes| N[Views Confirmation Page];
            N --> O[Receives Confirmation Email & Ticket];
            O --> P[End: Ticket in "My Tickets"];
            M -->|No| Q[Shows Payment Failed Message];
            Q --> K;
        ```
      * **Edge Cases & Error Handling**:
          * The event is sold out or ticket quantity is no longer available.
          * The user's payment method is declined.
          * The discount code is invalid or expired.
          * The user loses internet connection during the process.

  * **Organizer Creates a New Event**

      * **User Goal**: To create and publish a new event on the platform.
      * **Flow Diagram**
        ```mermaid
        graph TD
            A[Start: Organizer on Dashboard] --> B[Clicks "Create New Event"];
            B --> C["Step 1: Basic Info"];
            C --> D["Step 2: Event Details"];
            D --> E["Step 3: Ticketing"];
            E --> F["Step 4: Publish Settings"];
            F --> G[Clicks "Save & Publish"];
            G --> H[System Validates All Required Fields];
            H --> I{Validation OK?};
            I -->|Yes| J[Event is Created and Live];
            J --> K[End: Redirected to Event Management Page];
            I -->|No| L[Shows Error Messages on Form];
            L --> M["Redirects to Step with First Error <br> (e.g., Step 1, 2, or 3)"];
        ```
      * **Edge Cases & Error Handling**:
          * The user tries to publish without completing all required fields.
          * An uploaded image file is in the wrong format or too large.
          * The user tries to save a ticket type with a negative price or quantity.

-----
