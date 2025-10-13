import {
    pgTable,
    text,
    timestamp,
    boolean,
    integer,
    serial,
    pgEnum,
    json
} from "drizzle-orm/pg-core"

/**
 * Enum definitions for the event management system
 */

/**
 * Event status enum defining possible states for events
 * @enum {string}
 */
export const eventStatusEnum = pgEnum("event_status", ["ACTIVE", "ARCHIVED"])

/**
 * Registration status enum defining possible states for event registrations
 * @enum {string}
 */
export const registrationStatusEnum = pgEnum("registration_status", [
    "PENDING",
    "CONFIRMED",
    "CANCELLED"
])

/**
 * Payment method enum defining possible payment methods
 * @enum {string}
 */
export const paymentMethodEnum = pgEnum("payment_method", ["ONLINE", "OFFLINE"])

/**
 * Payment status enum defining possible states for payments
 * @enum {string}
 */
export const paymentStatusEnum = pgEnum("payment_status", [
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED"
])

/**
 * Age category enum defining possible age categories for attendees
 * @enum {string}
 */
export const ageCategoryEnum = pgEnum("age_category", [
    "TK",
    "SD",
    "SMP",
    "SMA"
])

/**
 * Belt level enum defining possible belt levels for martial arts events
 * @enum {string}
 */
export const beltLevelEnum = pgEnum("belt_level", [
    "DASAR",
    "MC_I",
    "MC_II",
    "MC_III",
    "MC_IV"
])

/**
 * Ticket type enum defining possible ticket types
 * @enum {string}
 */
export const ticketTypeEnum = pgEnum("ticket_type", ["ONLINE", "ONSITE"])

/**
 * Users table schema
 *
 * Stores user account information for authentication and profile management
 *
 * @property {string} id - Unique identifier for the user (text, primary key)
 * @property {string} name - User's full name (text, not null)
 * @property {string} email - User's email address (text, not null, unique)
 * @property {boolean} emailVerified - Whether the user's email is verified (boolean, not null, default: false)
 * @property {string} image - URL to the user's profile image (text, optional)
 * @property {string} avatar - User's avatar information (text, optional)
 * @property {string} avatarUrl - URL to the user's avatar (text, optional)
 * @property {Date} createdAt - Timestamp when the user account was created (timestamp, not null)
 * @property {Date} updatedAt - Timestamp when the user account was last updated (timestamp, not null)
 * @property {string} stripeCustomerId - Stripe customer ID if using subscription payments (text, optional)
 */
export const users = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified")
        .$defaultFn(() => false)
        .notNull(),
    image: text("image"),
    avatar: text("avatar"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    updatedAt: timestamp("updated_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    stripeCustomerId: text("stripe_customer_id")
})

/**
 * Categories table schema
 *
 * Stores event category information for organizing events
 *
 * @property {number} id - Serial identifier for the category (serial, primary key)
 * @property {string} name - Category name (text, not null)
 * @property {string} description - Category description (text, optional)
 * @property {Date} createdAt - Timestamp when category was created (timestamp, not null)
 * @property {Date} updatedAt - Timestamp when category was last updated (timestamp, not null)
 */
export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    updatedAt: timestamp("updated_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull()
})

/**
 * Events table schema
 *
 * Stores event information and metadata
 *
 * @property {number} id - Serial identifier for the event (serial, primary key)
 * @property {string} title - Event title (text, not null)
 * @property {string} description - Event description (text, not null)
 * @property {Date} startDate - Event start date and time (timestamp, not null)
 * @property {Date} endDate - Event end date and time (timestamp, not null)
 * @property {Date} registrationOpenDate - Date when registration opens (timestamp, not null)
 * @property {Date} registrationCloseDate - Date when registration closes (timestamp, not null)
 * @property {string} location - Event location (text, not null)
 * @property {string} image - URL for event image (text, optional)
 * @property {string} eventId - Custom event ID for URLs (text, not null, unique)
 * @property {string} status - Event status (event_status enum, default: "ACTIVE", not null)
 * @property {number} maxCapacity - Maximum number of attendees (integer, not null)
 * @property {number} adminFee - Administrative fee in cents (integer, default: 0, not null)
 * @property {Date} createdAt - Timestamp when event was created (timestamp, not null)
 * @property {Date} updatedAt - Timestamp when event was last updated (timestamp, not null)
 */
export const events = pgTable("events", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    registrationOpenDate: timestamp("registration_open_date").notNull(),
    registrationCloseDate: timestamp("registration_close_date").notNull(),
    location: text("location").notNull(),
    image: text("image_url"), // URL for event image
    eventId: text("event_id").notNull().unique(), // Custom event ID for URLs
    status: eventStatusEnum("status").default("ACTIVE").notNull(),
    maxCapacity: integer("max_capacity").notNull(),
    adminFee: integer("admin_fee").default(0).notNull(), // In cents
    createdAt: timestamp("created_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    updatedAt: timestamp("updated_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull()
})

/**
 * Event-Categories junction table schema
 *
 * Links events to categories (many-to-many relationship)
 *
 * @property {number} id - Serial identifier for the relationship (serial, primary key)
 * @property {number} eventId - Reference to events table (integer, not null, foreign key, cascade delete)
 * @property {number} categoryId - Reference to categories table (integer, not null, foreign key, cascade delete)
 */
export const eventCategories = pgTable("event_categories", {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
        .notNull()
        .references(() => events.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
        .notNull()
        .references(() => categories.id, { onDelete: "cascade" })
})

/**
 * Tickets table schema
 *
 * Stores ticket types and information for events
 *
 * @property {number} id - Serial identifier for the ticket (serial, primary key)
 * @property {number} eventId - Reference to events table (integer, not null, foreign key, cascade delete)
 * @property {string} name - Ticket name (e.g., "General Admission", "VIP") (text, not null)
 * @property {string} description - Ticket description (text, optional)
 * @property {number} price - Ticket price in cents (integer, not null)
 * @property {Date} availableFrom - Date when ticket becomes available (timestamp, not null)
 * @property {Date} availableUntil - Date when ticket availability ends (timestamp, not null)
 * @property {number} maxCapacity - Maximum number of this ticket type (integer, not null)
 * @property {string} type - Ticket type (ticket_type enum, default: "ONLINE", not null)
 * @property {Date} createdAt - Timestamp when ticket was created (timestamp, not null)
 * @property {Date} updatedAt - Timestamp when ticket was last updated (timestamp, not null)
 */
export const tickets = pgTable("tickets", {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
        .notNull()
        .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // e.g., "General Admission", "VIP"
    description: text("description"),
    price: integer("price").notNull(), // In cents
    availableFrom: timestamp("available_from").notNull(),
    availableUntil: timestamp("available_until").notNull(),
    maxCapacity: integer("max_capacity").notNull(),
    type: ticketTypeEnum("type").default("ONLINE").notNull(),
    createdAt: timestamp("created_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    updatedAt: timestamp("updated_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull()
})

/**
 * Registrations table schema
 *
 * Stores user registration information for events
 *
 * @property {number} id - Serial identifier for the registration (serial, primary key)
 * @property {number} eventId - Reference to events table (integer, not null, foreign key, cascade delete)
 * @property {string} userId - Reference to users table (text, not null, foreign key, cascade delete)
 * @property {string} registrationNumber - Unique registration number (text, not null, unique)
 * @property {string} status - Registration status (registration_status enum, default: "PENDING", not null)
 * @property {number} totalAmount - Total registration amount in cents (integer, not null)
 * @property {number} adminFee - Administrative fee in cents (integer, not null)
 * @property {string} paymentMethod - Payment method used (payment_method enum, not null)
 * @property {string} paymentStatus - Payment status (payment_status enum, default: "PENDING", not null)
 * @property {string} paymentId - Payment ID from payment gateway (text, optional)
 * @property {string} invoiceUrl - URL to download invoice (text, optional)
 * @property {Date} createdAt - Timestamp when registration was created (timestamp, not null)
 * @property {Date} updatedAt - Timestamp when registration was last updated (timestamp, not null)
 */
export const registrations = pgTable("registrations", {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
        .notNull()
        .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    registrationNumber: text("registration_number").notNull().unique(),
    status: registrationStatusEnum("status").default("PENDING").notNull(),
    totalAmount: integer("total_amount").notNull(), // In cents
    adminFee: integer("admin_fee").notNull(), // In cents
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    paymentStatus: paymentStatusEnum("payment_status")
        .default("PENDING")
        .notNull(),
    paymentId: text("payment_id"), // Ipaymu payment ID
    invoiceUrl: text("invoice_url"), // URL to download invoice
    createdAt: timestamp("created_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    updatedAt: timestamp("updated_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull()
})

/**
 * Attendees table schema
 *
 * Stores individual attendee information for registrations
 *
 * @property {number} id - Serial identifier for the attendee (serial, primary key)
 * @property {number} registrationId - Reference to registrations table (integer, not null, foreign key, cascade delete)
 * @property {string} fullName - Attendee's full name (text, not null)
 * @property {string} gender - Attendee's gender (text, not null)
 * @property {string} ageCategory - Attendee's age category (age_category enum, not null)
 * @property {string} beltLevel - Attendee's belt level (belt_level enum, not null)
 * @property {string} phoneNumber - Attendee's phone number (text, not null)
 * @property {string} biodataUrl - URL to uploaded biodata document (text, optional)
 * @property {string} consentUrl - URL to uploaded consent document (text, optional)
 * @property {number} ticketId - Reference to tickets table (integer, not null, foreign key)
 * @property {Date} createdAt - Timestamp when attendee was created (timestamp, not null)
 * @property {Date} updatedAt - Timestamp when attendee was last updated (timestamp, not null)
 */
export const attendees = pgTable("attendees", {
    id: serial("id").primaryKey(),
    registrationId: integer("registration_id")
        .notNull()
        .references(() => registrations.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    gender: text("gender").notNull(), // "male" or "female"
    ageCategory: ageCategoryEnum("age_category").notNull(),
    beltLevel: beltLevelEnum("belt_level").notNull(),
    phoneNumber: text("phone_number").notNull(),
    biodataUrl: text("biodata_url"), // URL to uploaded biodata document
    consentUrl: text("consent_url"), // URL to uploaded consent document
    ticketId: integer("ticket_id")
        .notNull()
        .references(() => tickets.id),
    createdAt: timestamp("created_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    updatedAt: timestamp("updated_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull()
})

/**
 * Messages table schema
 *
 * Stores bulk messages sent to users or event attendees
 *
 * @property {number} id - Serial identifier for the message (serial, primary key)
 * @property {string} title - Message title (text, not null)
 * @property {string} content - Message content (text, not null)
 * @property {string} senderId - Reference to users table (text, not null, foreign key, cascade delete)
 * @property {number} eventId - Optional reference to events table (integer, foreign key, cascade delete)
 * @property {Object} recipientFilter - JSON object for filtering message recipients (JSON, optional)
 * @property {Date} sentAt - Timestamp when message was sent (timestamp, not null)
 * @property {Date} createdAt - Timestamp when message was created (timestamp, not null)
 */
export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    senderId: text("sender_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    eventId: integer("event_id").references(() => events.id, {
        onDelete: "cascade"
    }), // Optional - can be for all users
    recipientFilter: json("recipient_filter"), // JSON object for filtering recipients (age, belt, etc.)
    sentAt: timestamp("sent_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    createdAt: timestamp("created_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull()
})

/**
 * Event Statistics table schema
 *
 * Stores analytics and statistics for events
 *
 * @property {number} id - Serial identifier for the statistics record (serial, primary key)
 * @property {number} eventId - Reference to events table (integer, not null, foreign key, cascade delete)
 * @property {number} totalRevenue - Total revenue in cents (integer, default: 0, not null)
 * @property {number} totalRegistrations - Total number of registrations (integer, default: 0, not null)
 * @property {Date} lastUpdated - Timestamp when statistics were last updated (timestamp, not null)
 * @property {Date} createdAt - Timestamp when statistics record was created (timestamp, not null)
 */
export const eventStatistics = pgTable("event_statistics", {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
        .notNull()
        .references(() => events.id, { onDelete: "cascade" }),
    totalRevenue: integer("total_revenue").default(0).notNull(), // In cents
    totalRegistrations: integer("total_registrations").default(0).notNull(),
    lastUpdated: timestamp("last_updated")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    createdAt: timestamp("created_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull()
})

/**
 * Sessions table schema
 *
 * Stores authentication session information
 *
 * @property {string} id - Session identifier (text, primary key)
 * @property {Date} expiresAt - Timestamp when the session expires (timestamp, not null)
 * @property {string} token - Session token (text, not null, unique)
 * @property {Date} createdAt - Timestamp when session was created (timestamp, not null)
 * @property {Date} updatedAt - Timestamp when session was last updated (timestamp, not null)
 * @property {string} ipAddress - IP address of the session (text, optional)
 * @property {string} userAgent - User agent string (text, optional)
 * @property {string} userId - Reference to users table (text, not null, foreign key, cascade delete)
 */
export const sessions = pgTable("sessions", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" })
})

/**
 * Accounts table schema
 *
 * Stores OAuth account information linked to users
 *
 * @property {string} id - Account identifier (text, primary key)
 * @property {string} accountId - External account ID (text, not null)
 * @property {string} providerId - OAuth provider ID (text, not null)
 * @property {string} userId - Reference to users table (text, not null, foreign key, cascade delete)
 * @property {string} accessToken - OAuth access token (text, optional)
 * @property {string} refreshToken - OAuth refresh token (text, optional)
 * @property {string} idToken - OAuth ID token (text, optional)
 * @property {Date} accessTokenExpiresAt - Timestamp when access token expires (timestamp, optional)
 * @property {Date} refreshTokenExpiresAt - Timestamp when refresh token expires (timestamp, optional)
 * @property {string} scope - OAuth scope (text, optional)
 * @property {string} password - Account password (text, optional)
 * @property {Date} createdAt - Timestamp when account was created (timestamp, not null)
 * @property {Date} updatedAt - Timestamp when account was last updated (timestamp, not null)
 */
export const accounts = pgTable("accounts", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull()
})

/**
 * Verifications table schema
 *
 * Stores verification tokens for actions like email verification
 *
 * @property {string} id - Verification identifier (text, primary key)
 * @property {string} identifier - Verification identifier (e.g., email) (text, not null)
 * @property {string} value - Verification value (e.g., token) (text, not null)
 * @property {Date} expiresAt - Timestamp when verification expires (timestamp, not null)
 * @property {Date} createdAt - Timestamp when verification was created (timestamp, not null)
 * @property {Date} updatedAt - Timestamp when verification was last updated (timestamp, not null)
 */
export const verifications = pgTable("verifications", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").$defaultFn(
        () => /* @__PURE__ */ new Date()
    ),
    updatedAt: timestamp("updated_at").$defaultFn(
        () => /* @__PURE__ */ new Date()
    )
})

/**
 * Subscriptions table schema
 *
 * Stores user subscription information
 *
 * @property {string} id - Subscription identifier (text, primary key)
 * @property {string} plan - Subscription plan name (text, not null)
 * @property {string} referenceId - Reference ID for the subscription (text, not null)
 * @property {string} stripeCustomerId - Stripe customer ID (text, optional)
 * @property {string} stripeSubscriptionId - Stripe subscription ID (text, optional)
 * @property {string} status - Subscription status (text, default: "incomplete")
 * @property {Date} periodStart - Start of the subscription period (timestamp, optional)
 * @property {Date} periodEnd - End of the subscription period (timestamp, optional)
 * @property {boolean} cancelAtPeriodEnd - Whether to cancel at period end (boolean, optional)
 * @property {number} seats - Number of seats in the subscription (integer, optional)
 * @property {Date} trialStart - Start of trial period (timestamp, optional)
 * @property {Date} trialEnd - End of trial period (timestamp, optional)
 */
export const subscriptions = pgTable("subscriptions", {
    id: text("id").primaryKey(),
    plan: text("plan").notNull(),
    referenceId: text("reference_id").notNull(),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    status: text("status").default("incomplete"),
    periodStart: timestamp("period_start"),
    periodEnd: timestamp("period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end"),
    seats: integer("seats"),
    trialStart: timestamp("trial_start"),
    trialEnd: timestamp("trial_end")
})

// Relations
import { relations } from "drizzle-orm"

export const usersRelations = relations(users, ({ many }) => ({
    registrations: many(registrations),
    messages: many(messages),
    sessions: many(sessions),
    accounts: many(accounts)
}))

export const eventsRelations = relations(events, ({ many, one }) => ({
    categories: many(eventCategories),
    tickets: many(tickets),
    registrations: many(registrations),
    statistics: one(eventStatistics, {
        fields: [events.id],
        references: [eventStatistics.eventId]
    })
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
    events: many(eventCategories)
}))

export const eventCategoriesRelations = relations(
    eventCategories,
    ({ one }) => ({
        event: one(events, {
            fields: [eventCategories.eventId],
            references: [events.id]
        }),
        category: one(categories, {
            fields: [eventCategories.categoryId],
            references: [categories.id]
        })
    })
)

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
    event: one(events, {
        fields: [tickets.eventId],
        references: [events.id]
    }),
    attendees: many(attendees)
}))

export const registrationsRelations = relations(
    registrations,
    ({ one, many }) => ({
        event: one(events, {
            fields: [registrations.eventId],
            references: [events.id]
        }),
        user: one(users, {
            fields: [registrations.userId],
            references: [users.id]
        }),
        attendees: many(attendees)
        // Removed circular reference to eventStatistics from registrations
    })
)

export const attendeesRelations = relations(attendees, ({ one }) => ({
    registration: one(registrations, {
        fields: [attendees.registrationId],
        references: [registrations.id]
    }),
    ticket: one(tickets, {
        fields: [attendees.ticketId],
        references: [tickets.id]
    })
}))

export const messagesRelations = relations(messages, ({ one }) => ({
    sender: one(users, {
        fields: [messages.senderId],
        references: [users.id]
    }),
    event: one(events, {
        fields: [messages.eventId],
        references: [events.id]
    })
}))

export const eventStatisticsRelations = relations(
    eventStatistics,
    ({ one }) => ({
        event: one(events, {
            fields: [eventStatistics.eventId],
            references: [events.id]
        })
    })
)

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id]
    })
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id]
    })
}))

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
    // Removed user reference to avoid potential circular references
}))
