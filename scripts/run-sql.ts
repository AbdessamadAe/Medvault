/**
 * Runs a .sql file against MIGRATION_DATABASE_URL. Used for one-off admin
 * SQL that isn't a Drizzle-managed migration (e.g. src/db/rls-policies.sql).
 *
 * Usage: npx tsx scripts/run-sql.ts <path-to-sql-file>
 */
import { config as loadEnv } from "dotenv";
import { readFileSync } from "node:fs";
import postgres from "postgres";

loadEnv({ path: ".env.local" });

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: npx tsx scripts/run-sql.ts <path-to-sql-file>");
  process.exit(1);
}

const connectionString = process.env.MIGRATION_DATABASE_URL;
if (!connectionString) {
  throw new Error("MIGRATION_DATABASE_URL is not set");
}

const sql = postgres(connectionString, { prepare: false });

async function main() {
  const script = readFileSync(filePath, "utf8");
  await sql.unsafe(script);
  console.log(`Ran ${filePath} successfully.`);
}

main()
  .catch((error) => {
    console.error("Failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
