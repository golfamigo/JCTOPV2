# Data Models

### User

  * **Purpose**: Represents an individual who can be either an attendee or an event organizer.
  * **Relationships**:
      * A **User** can have many **Registrations**.
      * A **User** (as an organizer) can create many **Events**.

#### TypeScript Interface

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  authProvider: 'email' | 'google' | 'line' | 'apple';
  createdAt: Date;
  updatedAt: Date;
}
```

### Event

  * [cite\_start]**Purpose**: Represents an event created by an organizer. [cite: 1400]
  * **Relationships**:
      * An **Event** belongs to one **User** (the organizer).
      * An **Event** belongs to one **Category**.
      * An **Event** belongs to one **Venue**.
      * An **Event** can have many **TicketTypes**.
      * An **Event** can have many **Registrations**.

#### TypeScript Interface

```typescript
interface Event {
  id: string;
  organizerId: string;
  categoryId: string;
  venueId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  status: 'draft' | 'published' | 'ended' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}
```

### Category

  * **Purpose**: Represents event categories for classification and filtering (e.g., "Music", "Sports", "Business").
  * **Relationships**:
      * A **Category** can have many **Events**.

#### TypeScript Interface

```typescript
interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Venue

  * **Purpose**: Represents physical or virtual venues where events take place, including seating area information.
  * **Relationships**:
      * A **Venue** can have many **Events**.

#### TypeScript Interface

```typescript
interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### TicketType

  * [cite\_start]**Purpose**: Defines a type of ticket available for an event, including its price and capacity. [cite: 1400]
  * **Relationships**:
      * A **TicketType** belongs to one **Event**.

#### TypeScript Interface

```typescript
interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quantity: number;
}
```

### Registration

  * [cite\_start]**Purpose**: Represents an attendee's registration for a specific event, acting as a link between a User and an Event. [cite: 1400]
  * **Relationships**:
      * A **Registration** belongs to one **User**.
      * A **Registration** belongs to one **Event**.

#### TypeScript Interface

```typescript
interface Registration {
  id: string;
  userId: string;
  eventId: string;
  status: 'pending' | 'paid' | 'cancelled' | 'checkedIn';
  qrCode: string;
  createdAt: Date;
}
```

### DiscountCode

  * [cite\_start]**Purpose**: Stores information about promotional codes that can be applied during registration. [cite: 1400]
  * **Relationships**:
      * A **DiscountCode** belongs to one **Event**.

#### TypeScript Interface

```typescript
interface DiscountCode {
  id: string;
  eventId: string;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  expiresAt: Date;
}
```

-----
