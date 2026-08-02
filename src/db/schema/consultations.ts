import { date, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { ownedRowColumns } from "./columns.helpers";
import { cases } from "./cases";
import { doctors } from "./doctors";

export const consultations = pgTable("consultations", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => cases.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctors.id, { onDelete: "restrict" }),
  date: date("date").notNull(),
  reason: text("reason").notNull(),
  notes: text("notes"),
  ...ownedRowColumns,
});
