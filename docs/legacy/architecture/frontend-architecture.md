# Frontend Architecture

### Component Architecture

#### Component Organization

```text
src/
└── components/
    ├── ui/
    │   ├── Button.tsx
    │   └── Input.tsx
    ├── features/
    │   ├── event/
    │   │   └── EventCard.tsx
    │   └── auth/
    │       └── LoginForm.tsx
    └── layouts/
        └── MainLayout.tsx
```

#### Component Template

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type MyComponentProps = {
  title: string;
};

const MyComponent = ({ title }: MyComponentProps) => {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Component styles
  },
});

export default MyComponent;
```

### State Management Architecture

#### State Structure

```text
src/
└── stores/
    ├── authStore.ts
    ├── eventStore.ts
    └── uiStore.ts
```

#### State Management Patterns

  * **authStore**: Manages user authentication state, token, and user profile.
  * **eventStore**: Manages lists of events, search/filter criteria, and the currently viewed event.
  * **uiStore**: Manages global UI state like loading indicators or modals.

### Routing Architecture

#### Route Organization

```text
app/
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── profile.tsx
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
├── _layout.tsx
└── event/[id].tsx
```

### Frontend Services Layer

#### API Client Setup

```typescript
// src/services/apiClient.ts
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const apiClient = axios.create({
  baseURL: '/api/v1', // Should be an environment variable
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

#### Service Example

```typescript
// src/services/eventService.ts
import apiClient from './apiClient';
import { Event } from '../../packages/shared-types';

export const getEvents = async (): Promise<Event[]> => {
  const response = await apiClient.get('/events');
  return response.data;
};
```

-----

Of course. Here is the complete UI/UX Specification document we built together.

## Introduction

This document defines the user experience goals, information architecture, user flows, and visual design specifications for the JCTOP EVENT platform's user interface. It serves as the foundation for visual design and frontend development, ensuring a cohesive and user-centered experience.

  * **Overall UX Goals & Principles**

      * **Target User Personas**
          * **Event Attendees**: Users of all ages seeking a fast and easy way to find, register for, and manage tickets for events.
          * **Event Organizers**: Individuals or organizations needing powerful, efficient tools to manage all aspects of their events, from creation to on-site check-in.
          * **Platform Administrators**: The internal team responsible for platform maintenance, support, and configuration.
      * **Usability Goals**
          * **Intuitive Design**: The interface will be clean and straightforward, aligning with modern UI/UX conventions to reduce the learning curve.
          * **Clear Workflows**: All operational flows, like registration or event creation, will be clear and simple for users to follow.
          * **Helpful Feedback**: The system will provide clear guidance and error messages to assist users.
      * **Design Principles**
        1.  **Clarity Above All**: Prioritize clear, unambiguous communication and intuitive layouts over overly complex or clever design.
        2.  **Efficiency for All Users**: Design workflows that are simple for new users but allow power users (like organizers) to accomplish tasks quickly.
        3.  **Consistent & Predictable**: Use familiar UI patterns and maintain a consistent design language throughout the web, iOS, and Android applications to build user trust and confidence.

  * **Change Log**

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-07-30 | 1.0 | Initial draft of UI/UX Specification. | Sally (UX Expert) |

-----

## Information Architecture (IA)

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

## User Flows

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

## Wireframes & Mockups

  * **Primary Design Files**: `(Link to a collaborative design file, e.g., Figma, will be placed here)`

  * **Key Screen Layouts**

      * **1. Event List / Discovery Page**
          * **Purpose**: To allow users to easily browse, search, filter, and discover events.
          * **Key Elements**: Prominent search bar, Filter & Sort controls, a grid or list of `Event Cards`, "Favorite" icon on each card, Pagination controls.
      * **2. Event Details Page**
          * **Purpose**: To provide comprehensive information about a single event and serve as the starting point for registration.
          * **Key Elements**: Hero image, Event title/date/time/location, Detailed description, Real-time ticket count, Interactive map, Social sharing buttons, a primary "Register" call-to-action.
      * **3. User Dashboard / My Tickets**
          * **Purpose**: To give logged-in users a central place to view their upcoming and past event registrations.
          * **Key Elements**: A list of tickets for upcoming events with scannable QR codes, a section for past events, links to "My Favorites" and "Profile Settings".
      * **4. Organizer Dashboard**
          * **Purpose**: To provide event organizers with a high-level overview of their activities and quick access to management tools.
          * **Key Elements**: Key statistics (revenue, attendees), A list of their created events (filterable), a primary "Create New Event" button.

-----

## Component Library / Design System

  * **Design System Approach**: We will **utilize and extend the existing Chakra UI component library**. Our strategy will be to use Chakra's primitives to compose our application-specific components, ensuring consistency and accelerating development.

  * **Core Components**

      * **EventCard**: To display a summary of an event in lists and grids.
      * **SearchAndFilterBar**: A composite component that combines keyword search with controls for filtering and sorting events.
      * **StepIndicator**: To visually guide users through multi-step processes like event creation or registration.

-----

## Branding & Style Guide

  * **Visual Identity**: `(Link to official company brand guidelines, if they exist, will be placed here)`

  * **Color Palette**

| Color Type | Hex Code | Usage |
| :--- | :--- | :--- |
| Primary | `#2563EB` | Main buttons, links, and active elements |
| Secondary | `#475569` | Secondary text, borders, and UI accents |
| Accent | `#F59E0B` | Special call-outs, highlights |
| Success | `#10B981` | Positive feedback, confirmations |
| Warning | `#FBBF24` | Cautions, important notices |
| Error | `#EF4444` | Errors, destructive actions |
| Neutral | `#F8FAFC`, `#E2E8F0`, `#64748B`, `#0F172A` | Backgrounds, borders, text |

  * **Typography**

      * **Font Families**
          * **Primary (Traditional Chinese)**: **Noto Sans TC (思源黑體)**.
          * **Primary (Latin Characters / Numbers)**: **`Inter`**.
          * **Monospace**: `Roboto Mono`.
      * **Type Scale**

    | Element | Size | Weight | Line Height |
    | :--- | :--- | :--- | :--- |
    | H1 | 36px | Bold (700) | 1.2 |
    | H2 | 30px | Bold (700) | 1.2 |
    | H3 | 24px | Semi-Bold (600) | 1.3 |
    | Body | 16px | Normal (400) | 1.5 |
    | Small | 14px | Normal (400) | 1.5 |

  * **Iconography**

      * **Icon Library**: We will use the **Feather Icons** library for a consistent, lightweight, and modern set of icons.

  * **Spacing & Layout**

      * **Grid System**: The layout will be based on a **4-pixel grid system**.

-----

## Accessibility Requirements

  * **Compliance Target**: The JCTOP EVENT platform will be developed to meet the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA** compliance standard.

  * **Key Requirements**

      * **Visual**: Ensure high color contrast, visible focus indicators, and resizable text.
      * **Interaction**: All functionality will be accessible via keyboard and compatible with screen readers. Touch targets will be appropriately sized.
      * **Content**: All images will have alternative text, pages will have a logical heading structure, and form inputs will have clear labels.

  * **Testing Strategy**: We will use a combination of automated tools and regular manual testing (keyboard-only, screen readers) to ensure compliance.

-----

## Responsiveness Strategy

  * **Breakpoints**

| Breakpoint | Min Width | Target Devices |
| :--- | :--- | :--- |
| **Mobile** | 320px | Phones |
| **Tablet** | 768px | Tablets |
| **Desktop** | 1024px | Laptops, Desktops |
| **Wide** | 1440px | Large Monitors |

  * **Adaptation Patterns**: The layout will adapt from a single column on mobile to multi-column on larger screens. Navigation will also adapt, using a tab bar on mobile and a header or sidebar on desktop.

-----

## Animation & Micro-interactions

  * **Motion Principles**

      * **Essential & Functional First**: Animations will only be used when they serve a clear functional purpose, such as providing critical feedback or reducing cognitive load.
      * **Responsive and Performant**: All animations must be lightweight and optimized.
      * **Subtle and Consistent**: Animations will be subtle and used consistently.

  * **Key Essential Animations**

    1.  **Critical State Feedback**: Visual feedback for interactive elements (e.g., button presses).
    2.  **Essential Loading Indicators**: Spinners or skeleton screens during data fetching.
    3.  **Action Confirmation**: Feedback after a user completes an important action (e.g., a checkmark on form submission).

-----

## Performance Considerations

  * **Performance Goals**

      * **Page Load**: Core pages must load within 3 seconds.
      * **Interaction Response**: Key API interactions should feel instantaneous (under 500ms).
      * **Animation FPS**: All essential animations must maintain a smooth 60 frames per second (FPS).

  * **Design Strategies**: We will use image optimization, lazy loading of content, and skeleton screens to manage perceived wait times.

-----

