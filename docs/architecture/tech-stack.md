# Tech Stack

This table specifies the exact technologies and versions to be used by all development agents.

| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| Frontend Language | TypeScript | \~5.5 | Primary language for frontend | Provides strong typing to reduce errors and improve code quality in a large application. |
| Frontend Framework | Expo (React Native) | \~51.0 | Core framework for Web, iOS, & Android | Fulfills the PRD goal of single-codebase, multi-platform development. |
| UI Component Library | Chakra UI | \~2.8 | UI components for the Expo app | Selected in the PRD for its customizability and modern design. |
| State Management | Zustand | \~4.5 | Client-side state management | A simple, fast, and scalable state management solution with minimal boilerplate, ideal for an MVP. |
| Backend Language | TypeScript | \~5.5 | Primary language for backend | Ensures type safety and allows for shared types with the frontend in a monorepo. |
| Backend Framework | NestJS | \~10.3 | Backend framework for building the API | A robust, scalable framework that provides an enterprise-grade, modular architecture out-of-the-box. |
| API Style | REST API | OpenAPI 3.1 | API communication protocol | A well-understood, mature standard for building APIs. OpenAPI spec will ensure clear documentation. |
| Database | PostgreSQL | 16 | Primary relational database | Specified in the PRD for its robustness and reliability. |
| File Storage | Zeabur Object Storage | N/A | For storing user-uploaded files like event images | A managed, S3-compatible service that integrates seamlessly with the Zeabur platform. |
| Authentication | Passport.js | \~0.7 | Authentication middleware for Node.js | A flexible and modular library that supports both local (email/pass) and federated (Google, etc.) authentication. |
| Frontend Testing | Jest & R. T. Library | \~29.7 | Unit & component testing | The standard for testing React applications, ensuring UI components are reliable. |
| Backend Testing | Jest & Supertest | \~29.7 | Unit & E2E API testing | Jest is a versatile test runner, and Supertest simplifies testing HTTP endpoints. |
| CI/CD | Zeabur CI/CD | N/A | Continuous Integration & Deployment | Managed by the Zeabur platform, triggered automatically by git pushes for simple, reliable deployments. |
| Monitoring & Logging | Zeabur Monitoring | N/A | Observability and debugging | Built-in service provided by the Zeabur platform for real-time logs and performance metrics. |

-----
frontend must follow the all guides in E:\gitHub\JCTOPV2\docs\UIUX directry
