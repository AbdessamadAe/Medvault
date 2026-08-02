import { config as loadEnv } from "dotenv";
import postgres from "postgres";

loadEnv({ path: ".env.local" });

const sql = postgres(process.env.MIGRATION_DATABASE_URL!, { prepare: false });

async function main() {
  const tables = await sql`
    select relname as table_name, relrowsecurity as rls_enabled
    from pg_class
    where relnamespace = 'public'::regnamespace and relkind = 'r'
    order by relname
  `;
  console.log("Tables + RLS enabled:", tables);

  const bucket = await sql`
    select id, name, public from storage.buckets where id = 'medical-files'
  `;
  console.log("Storage bucket:", bucket);

  const policies = await sql`
    select schemaname, tablename, policyname from pg_policies
    where schemaname in ('public', 'storage')
    order by schemaname, tablename
  `;
  console.log("Policies:", policies);
}

main()
  .catch((error) => console.error("Failed:", error.message))
  .finally(() => sql.end());
