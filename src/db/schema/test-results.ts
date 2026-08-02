import { date, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { ownedRowColumns } from "./columns.helpers";
import { consultations } from "./consultations";
import { testResultTypeEnum } from "./enums";

export const testResults = pgTable("test_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  consultationId: uuid("consultation_id")
    .notNull()
    .references(() => consultations.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  type: testResultTypeEnum("type").notNull(),
  testName: text("test_name").notNull(),
  resultNotes: text("result_notes"),
  ...ownedRowColumns,
});
