import { date, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { ownedRowColumns } from "./columns.helpers";
import { illnessStatusEnum } from "./enums";

export const illnesses = pgTable("illnesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  status: illnessStatusEnum("status").notNull().default("active"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  notes: text("notes"),
  ...ownedRowColumns,
});
