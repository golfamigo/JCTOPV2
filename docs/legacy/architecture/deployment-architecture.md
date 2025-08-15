# Deployment Architecture

### Deployment Strategy

A **Git-driven deployment strategy** will be used with Zeabur. Pushing to the `main` branch will automatically trigger builds and deployments for both the frontend and backend services.

### CI/CD Pipeline

The CI/CD pipeline is managed automatically by Zeabur.

### Environments

| Environment | Frontend URL | Backend URL | Purpose & Trigger |
| :--- | :--- | :--- | :--- |
| **Development** | `http://localhost:8081` | `http://localhost:3001` | Local development. |
| **Staging** | `jctop-event-staging.zeabur.app` | `jctop-event-api-staging.zeabur.app` | Deployed on pushes to the `develop` branch. |
| **Production** | `jctop-event.zeabur.app` | `jctop-event-api.zeabur.app` | Deployed on pushes to the `main` branch. |

-----
