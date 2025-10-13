-- EventTS Database Schema for Supabase

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Enum definitions
CREATE TYPE event_status AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE registration_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('ONLINE', 'OFFLINE');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE age_category AS ENUM ('TK', 'SD', 'SMP', 'SMA');
CREATE TYPE belt_level AS ENUM ('DASAR', 'MC_I', 'MC_II', 'MC_III', 'MC_IV');
CREATE TYPE ticket_type AS ENUM ('ONLINE', 'ONSITE');

-- 2. Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    image TEXT,
    avatar TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    stripe_customer_id TEXT
);

-- 3. Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Events table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    registration_open_date TIMESTAMP NOT NULL,
    registration_close_date TIMESTAMP NOT NULL,
    location TEXT NOT NULL,
    image_url TEXT,
    event_id TEXT NOT NULL UNIQUE,
    status event_status NOT NULL DEFAULT 'ACTIVE',
    max_capacity INTEGER NOT NULL,
    admin_fee INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Event-Categories junction table
CREATE TABLE event_categories (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE
);

-- 6. Tickets table
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "General Admission", "VIP"
    description TEXT,
    price INTEGER NOT NULL, -- In cents
    available_from TIMESTAMP NOT NULL,
    available_until TIMESTAMP NOT NULL,
    max_capacity INTEGER NOT NULL,
    type ticket_type NOT NULL DEFAULT 'ONLINE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7. Registrations table
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registration_number TEXT NOT NULL UNIQUE,
    status registration_status NOT NULL DEFAULT 'PENDING',
    total_amount INTEGER NOT NULL, -- In cents
    admin_fee INTEGER NOT NULL, -- In cents
    payment_method payment_method NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'PENDING',
    payment_id TEXT, -- Ipaymu payment ID
    invoice_url TEXT, -- URL to download invoice
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 8. Attendees table
CREATE TABLE attendees (
    id SERIAL PRIMARY KEY,
    registration_id INTEGER NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL, -- "male" or "female"
    age_category age_category NOT NULL,
    belt_level belt_level NOT NULL,
    phone_number TEXT NOT NULL,
    biodata_url TEXT, -- URL to uploaded biodata document
    consent_url TEXT, -- URL to uploaded consent document
    ticket_id INTEGER NOT NULL REFERENCES tickets(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 9. Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE, -- Optional - can be for all users
    recipient_filter JSONB, -- JSON object for filtering recipients (age, belt, etc.)
    sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 10. Event Statistics table
CREATE TABLE event_statistics (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    total_revenue INTEGER NOT NULL DEFAULT 0, -- In cents
    total_registrations INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 11. Sessions table
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    expires_at TIMESTAMP NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Accounts table
CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at TIMESTAMP,
    refresh_token_expires_at TIMESTAMP,
    scope TEXT,
    password TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 13. Verifications table
CREATE TABLE verifications (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 14. Subscriptions table
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,
    plan TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT DEFAULT 'incomplete',
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN,
    seats INTEGER,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_attendees_registration_id ON attendees(registration_id);
CREATE INDEX idx_attendees_ticket_id ON attendees(ticket_id);
CREATE INDEX idx_attendees_age_category ON attendees(age_category);
CREATE INDEX idx_attendees_belt_level ON attendees(belt_level);
CREATE INDEX idx_messages_event_id ON messages(event_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_event_statistics_event_id ON event_statistics(event_id);