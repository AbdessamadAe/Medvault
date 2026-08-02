import { pgSchema, uuid } from "drizzle-orm/pg-core";

/**
 * Read-only reference to Supabase's own `auth.users` table so our tables can
 * declare a real foreign key on `owner_id`. Supabase manages this table's
 * migrations; we never create or alter it ourselves.
 */
export const authUsers = pgSchema("auth").table("users", {
  id: uuid("id").primaryKey(),
});
