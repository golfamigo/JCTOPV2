# Technical Assumptions

### Repository Structure: Monorepo
* **Recommendation**: A **Monorepo** structure will be used to simplify code sharing (types, utils) and streamline the build process for the full-stack application.

### Service Architecture
* **Recommendation**: The system will use a **decoupled service architecture**. The Expo frontend will communicate with a backend via an API, allowing the frontend and backend to be developed, deployed, and scaled independently.

### Testing Requirements
* **Recommendation**: The testing strategy will include **Unit and Integration tests** to provide a balance of speed and confidence, fulfilling the requirement for automated testing.

### Additional Technical Assumptions and Requests
* [cite_start]It is assumed that all third-party services (e.g., ECPay, mapping APIs) provide stable, well-documented APIs[cite: 9].
* It is assumed the backend services and PostgreSQL database will be hosted on a major cloud provider, to be determined during the architecture phase.
