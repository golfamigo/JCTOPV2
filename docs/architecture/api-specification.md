# API Specification

### REST API Specification

This specification outlines the endpoints for managing users, events, and registrations. All endpoints will be prefixed with `/api/v1`.

```yaml
openapi: 3.0.1
info:
  title: JCTOP EVENT API
  version: 1.0.0
  description: The official API for the JCTOP EVENT platform, managing events, users, and registrations.
servers:
  - url: /api/v1
    description: API Version 1

paths:
  /auth/register:
    post:
      summary: Register a new user
      tags: [Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NewUser'
      responses:
        '201':
          description: User created successfully
  /auth/login:
    post:
      summary: Log in a user
      tags: [Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginCredentials'
      responses:
        '200':
          description: Login successful, returns JWT
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
  /events:
    get:
      summary: List all published events
      tags: [Events]
      parameters:
        - name: search
          in: query
          schema:
            type: string
        - name: category
          in: query
          schema:
            type: string
      responses:
        '200':
          description: A list of events.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Event'
  /events/{eventId}:
    get:
      summary: Get details for a specific event
      tags: [Events]
      parameters:
        - name: eventId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Event details.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Event'

  /events/{eventId}/register:
    post:
      summary: Register for an event
      tags: [Registrations]
      security:
        - bearerAuth: []
      parameters:
        - name: eventId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NewRegistration'
      responses:
        '201':
          description: Registration successful

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    NewUser:
      type: object
      properties:
        name:
          type: string
        email:
          type: string
          format: email
        password:
          type: string
    LoginCredentials:
      type: object
      properties:
        email:
          type: string
          format: email
        password:
          type: string
    Event:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        startDate:
          type: string
          format: date-time
        # ... other event properties
    NewRegistration:
      type: object
      properties:
        ticketTypeId:
          type: string
          format: uuid
        quantity:
          type: integer
        discountCode:
          type: string
```

-----
