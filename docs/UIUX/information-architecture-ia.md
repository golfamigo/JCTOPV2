# Information Architecture (IA)

  * **Site Map / Screen Inventory**
    This diagram shows the overall structure of the JCTOP EVENT platform, including public-facing pages, user-specific areas, and the organizer's management panel.

    ```mermaid
    graph TD
        A[Public Homepage] --> B[Event List / Search]
        A --> C[Login / Register]
        
        B --> D[Event Details Page]
        
        subgraph "Authenticated User"
            E[User Dashboard]
            F[My Tickets / Registrations]
            G[My Favorites]
            H[My Profile]
            E --> F & G & H
        end

        subgraph "Event Organizer"
            I[Organizer Dashboard]
            J[My Events List]
            K[Create/Edit Event Wizard]
            L[Attendee Management]
            M[Analytics & Reports]
            I --> J & K & L & M
        end

        C --> E
        C --> I
        D -- "Register" --> F
    ```

  * **Navigation Structure**

      * **Primary Navigation (Authenticated Attendee)**: The main navigation will be a tab bar (on mobile) or a persistent header (on web) with links to: **Events**, **My Tickets**, **My Favorites**, and **Profile**.
      * **Primary Navigation (Authenticated Organizer)**: Organizers will have a persistent sidebar or header with links to their main management areas: **Dashboard**, **Events**, **Attendees**, and **Analytics**.
      * **Secondary Navigation**: Within complex sections like the "Create/Edit Event Wizard," secondary navigation (e.g., step indicators) will be used to guide the user.
      * **Breadcrumb Strategy**: Breadcrumbs will be used on nested pages, especially within the Organizer panel, to show the user their current location in the hierarchy (e.g., `My Events > Tech Conference > Manage Attendees`).

-----
