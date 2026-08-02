import { sql } from "drizzle-orm";
import { date, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { ownedRowColumns } from "./columns.helpers";
import { bodySystemEnum, caseStatusEnum } from "./enums";

export const cases = pgTable("cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  status: caseStatusEnum("status").notNull().default("active"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  notes: text("notes"),
  bodySystems: bodySystemEnum("body_systems")
    .array()
    .notNull()
    .default(sql`ARRAY[]::body_system[]`),
  ...ownedRowColumns,
});
