import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Optimized for serverless environments
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 5, // Keep connection pool small in serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DATABASE_URL.includes("neon.tech") ? { rejectUnauthorized: false } : undefined
});

export const db = drizzle(pool, { schema });

export * from "./schema/index.js";
