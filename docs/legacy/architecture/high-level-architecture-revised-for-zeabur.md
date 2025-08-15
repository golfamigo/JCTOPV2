# High Level Architecture (Revised for Zeabur)

### Technical Summary

This architecture describes a modern, decoupled full-stack application deployed on the Zeabur platform. The frontend will be a cross-platform Expo application, deployed as a Zeabur Frontend Service for optimal performance. It will communicate with a Node.js backend, deployed as a Zeabur Backend Service. A managed PostgreSQL service on Zeabur will serve as the primary data store. This managed service approach simplifies operations, provides seamless auto-scaling, and allows the development team to focus on features rather than infrastructure.

### Platform and Infrastructure Choice

  * **Platform:** Zeabur
  * **Key Services:**
      * **Frontend Service:** To build and serve the Expo for Web application with global CDN.
      * **Backend Service:** To run the Node.js API.
      * **PostgreSQL Service:** A managed PostgreSQL database provisioned directly within the project.
  * **Deployment Host and Regions:** Zeabur automatically selects the region closest to the database to minimize latency. We will provision our database in a region appropriate for the Asia-Pacific audience.

### Repository Structure

  * **Structure:** Monorepo
  * **Monorepo Tool:** Turborepo
  * **Package Organization:** The monorepo will contain separate packages for the `expo-app` (frontend), `api-server` (backend), and `shared-types`. Zeabur can automatically detect and deploy the services from this structure.

### High Level Architecture Diagram

```mermaid
graph TD
    subgraph User
        U[Attendees & Organizers]
    end

    subgraph "Zeabur Platform"
        subgraph "Frontend"
            FE_Svc[Frontend Service <br> Expo for Web]
        end

        subgraph "Backend"
            BE_Svc[Backend Service <br> Node.js API]
        end

        subgraph "Data Store"
            DB[(PostgreSQL Service)]
        end

        subgraph "Integrations"
            N8N[n8n <br> (External or Deployed Service)]
            ECPay[ECPay API <br> (External)]
        end
    end

    U -- "HTTPS" --> FE_Svc
    FE_Svc -- "API Calls" --> BE_Svc
    BE_Svc --> DB
    BE_Svc -- "Payment" --> ECPay
    BE_Svc -- "Automation" --> N8N

    subgraph "Mobile Clients"
        MC[iOS & Android Apps <br> (Expo Go / Native Build)]
    end

    MC -- "API Calls" --> BE_Svc
```

### Architectural Patterns

  * **Managed Service Architecture:** By using Zeabur, we adopt a pattern where we deploy code and link services without managing the underlying servers, networking, or infrastructure, gaining the benefits of serverless (auto-scaling, low management overhead) with the simplicity of a service-based model.
  * **Backend for Frontend (BFF) Pattern:** The Node.js API serves as a dedicated backend for our frontend clients (Web, iOS, Android), handling aggregation of data and business logic specific to the UI's needs.
  * **Repository Pattern:** The backend will continue to use the repository pattern to abstract data access logic, making it easy to test and maintain.
  * **Component-Based UI:** The Expo (React Native) frontend will be built using small, reusable components, a pattern well-suited for maintainability.

-----
