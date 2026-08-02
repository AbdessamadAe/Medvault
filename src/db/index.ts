import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// A single shared connection with a small pool, reused across requests in
// the same server runtime. Supabase's pooled (pgbouncer) connection string
// already handles connection limiting on its side.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
