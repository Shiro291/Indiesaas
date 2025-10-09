import { drizzle } from "drizzle-orm/node-postgres"

/**
 * Database connection instance using Drizzle ORM
 * 
 * This instance provides the database connection for the application
 * using the PostgreSQL database URL from environment variables.
 * 
 * @type {any} db - The Drizzle ORM database instance
 */
export const db = drizzle(process.env.DATABASE_URL!)
