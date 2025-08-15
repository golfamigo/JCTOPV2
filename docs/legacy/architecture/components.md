# Components

### Frontend App (Expo Client)

  * **Responsibility**: To provide the complete user interface for both attendees and organizers across Web, iOS, and Android platforms. It handles all user interactions, state management, and communication with the backend API.
  * **Technology Stack**: Expo (React Native), TypeScript, Zustand, Chakra UI.

### API Gateway

  * **Responsibility**: Acts as the single, secure entry point for all requests from the frontend clients. It is responsible for request routing, authentication, rate limiting, and CORS policy enforcement.
  * **Technology Stack**: Managed by Zeabur's ingress routing.

### Authentication Service

  * **Responsibility**: Manages all aspects of user identity, including registration, login (email/password and social), password reset, and session management via JWTs.
  * **Technology Stack**: NestJS, TypeScript, Passport.js.

### Event Service

  * **Responsibility**: Handles all business logic related to events. This includes creation, updating, publishing, and public discovery (listing, searching, filtering).
  * **Technology Stack**: NestJS, TypeScript.

### Registration Service

  * **Responsibility**: Manages the end-to-end process of registering a user for an event. This includes ticket selection, discount code validation, payment processing, and ticket (QR code) generation.
  * **Technology Stack**: NestJS, TypeScript.

### PostgreSQL Database

  * **Responsibility**: Serves as the primary data store for all application data, including users, events, registrations, and tickets. It ensures data integrity and persistence.
  * **Technology Stack**: PostgreSQL (Managed by Zeabur).

-----
