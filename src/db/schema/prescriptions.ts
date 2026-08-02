import { date, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { ownedRowColumns } from "./columns.helpers";
import { consultations } from "./consultations";

export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  consultationId: uuid("consultation_id")
    .notNull()
    .references(() => consultations.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  notes: text("notes"),
  ...ownedRowColumns,
});
