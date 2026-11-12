import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * node-postgres over Neon's pooled connection string, per Neon's guidance for
 * apps hosted on Vercel (Fluid compute reuses the pool across invocations).
 * `attachDatabasePool` lets Vercel close idle clients before a function
 * instance is suspended; outside Vercel it's a no-op.
 *
 * The pool connects lazily on first query, so importing this module at build
 * time is safe.
 */
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool = (globalForDb.pool ??= new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10_000,
}));
attachDatabasePool(pool);

export const db = drizzle({ client: pool, schema });

export { schema };
