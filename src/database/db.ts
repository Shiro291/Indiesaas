import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

/**
 * Database connection instance using Drizzle ORM
 * 
 * This instance provides the database connection for the application
 * using the PostgreSQL database URL from environment variables.
 * For Supabase compatibility, SSL mode is enforced.
 * 
 * @type {any} db - The Drizzle ORM database instance
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});

export const db = drizzle(pool)
