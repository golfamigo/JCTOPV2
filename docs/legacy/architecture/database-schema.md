# Database Schema

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for both attendees and organizers
CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password_hash" VARCHAR(255),
  "auth_provider" VARCHAR(50) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories for event classification
CREATE TABLE "categories" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT,
  "color" VARCHAR(7) NOT NULL DEFAULT '#6366f1', -- Hex color code
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Venues where events take place
CREATE TABLE "venues" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" VARCHAR(255) NOT NULL,
  "address" TEXT,
  "city" VARCHAR(255),
  "capacity" INTEGER NOT NULL DEFAULT 0,
  "description" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events created by organizers
CREATE TABLE "events" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizer_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "category_id" UUID NOT NULL REFERENCES "categories"("id") ON DELETE RESTRICT,
  "venue_id" UUID NOT NULL REFERENCES "venues"("id") ON DELETE RESTRICT,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "start_date" TIMESTAMPTZ NOT NULL,
  "end_date" TIMESTAMPTZ NOT NULL,
  "location" TEXT,
  "status" VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, published, ended, paused
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ticket types for each event
CREATE TABLE "ticket_types" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "price" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  "quantity" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Registrations linking users to events
CREATE TABLE "registrations" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "status" VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid, cancelled, checkedIn
  "qr_code" TEXT UNIQUE NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Discount codes for events
CREATE TABLE "discount_codes" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "code" VARCHAR(255) NOT NULL,
  "type" VARCHAR(50) NOT NULL, -- percentage, fixed_amount
  "value" DECIMAL(10, 2) NOT NULL,
  "expires_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("event_id", "code")
);

-- Indexes for performance
CREATE INDEX ON "events" ("organizer_id");
CREATE INDEX ON "events" ("category_id");
CREATE INDEX ON "events" ("venue_id");
CREATE INDEX ON "events" ("status");
CREATE INDEX ON "events" ("start_date");
CREATE INDEX ON "categories" ("name");
CREATE INDEX ON "venues" ("city");
CREATE INDEX ON "ticket_types" ("event_id");
CREATE INDEX ON "registrations" ("user_id");
CREATE INDEX ON "registrations" ("event_id");
CREATE INDEX ON "discount_codes" ("event_id");
```

-----
