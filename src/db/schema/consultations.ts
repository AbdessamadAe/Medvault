import { date, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { ownedRowColumns } from "./columns.helpers";
import { illnesses } from "./illnesses";
import { doctors } from "./doctors";

export const consultations = pgTable("consultations", {
  id: uuid("id").primaryKey().defaultRandom(),
  illnessId: uuid("illness_id")
    .notNull()
    .references(() => illnesses.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctors.id, { onDelete: "restrict" }),
  date: date("date").notNull(),
  reason: text("reason").notNull(),
  notes: text("notes"),
  ...ownedRowColumns,
});
