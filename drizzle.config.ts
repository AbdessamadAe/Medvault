import { defineConfig } from "drizzle-kit";

const connectionString = process.env.MIGRATION_DATABASE_URL;

if (!connectionString) {
  throw new Error("MIGRATION_DATABASE_URL is not set");
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  // We manage auth.users ourselves as a read-only reference (see
  // src/db/schema/auth.ts) — never let drizzle-kit try to diff or drop it.
  schemaFilter: ["public"],
});
