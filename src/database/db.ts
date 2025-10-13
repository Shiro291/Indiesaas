import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { 
  users, 
  categories, 
  events, 
  eventCategories, 
  tickets, 
  registrations, 
  attendees, 
  messages, 
  eventStatistics,
  sessions,
  accounts,
  verifications,
  subscriptions,
  usersRelations,
  eventsRelations,
  categoriesRelations,
  eventCategoriesRelations,
  ticketsRelations,
  registrationsRelations,
  attendeesRelations,
  messagesRelations,
  eventStatisticsRelations,
  sessionsRelations,
  accountsRelations,
  subscriptionsRelations
} from "./schema"

/**
 * Database connection instance using Drizzle ORM
 *
 * This instance provides the database connection for the application
 * using the PostgreSQL database URL from environment variables.
 * For Supabase compatibility, SSL mode is enforced.
 *
 * @type {any} db - The Drizzle ORM database instance
 */
 
// Validate that DATABASE_URL exists before creating the connection
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in environment variables");
  process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase connections
    }
})

export const db = drizzle(pool, { 
  schema: {
    users,
    categories,
    events,
    eventCategories,
    tickets,
    registrations,
    attendees,
    messages,
    eventStatistics,
    sessions,
    accounts,
    verifications,
    subscriptions,
    usersRelations,
    eventsRelations,
    categoriesRelations,
    eventCategoriesRelations,
    ticketsRelations,
    registrationsRelations,
    attendeesRelations,
    messagesRelations,
    eventStatisticsRelations,
    sessionsRelations,
    accountsRelations,
    subscriptionsRelations
  }
})
