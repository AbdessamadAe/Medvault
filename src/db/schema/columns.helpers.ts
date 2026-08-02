import { timestamp, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "./auth";

/**
 * Every table gets these so Row Level Security can enforce
 * `owner_id = auth.uid()` identically everywhere. Spread this into each
 * table definition rather than redefining the columns by hand.
 */
export const ownedRowColumns = {
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => authUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};
