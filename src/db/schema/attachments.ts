import { sql } from "drizzle-orm";
import { check, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { ownedRowColumns } from "./columns.helpers";
import { consultations } from "./consultations";
import { prescriptions } from "./prescriptions";
import { testResults } from "./test-results";

/**
 * A file belongs to exactly one of consultation / prescription / test
 * result — never zero, never more than one. Enforced by the CHECK below,
 * not just application code.
 */
export const attachments = pgTable(
  "attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    consultationId: uuid("consultation_id").references(() => consultations.id, {
      onDelete: "cascade",
    }),
    prescriptionId: uuid("prescription_id").references(() => prescriptions.id, {
      onDelete: "cascade",
    }),
    testResultId: uuid("test_result_id").references(() => testResults.id, {
      onDelete: "cascade",
    }),
    // Random storage path inside the private bucket — never derived from the
    // original filename, so medical info never leaks through file paths/URLs.
    storageKey: text("storage_key").notNull().unique(),
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    ...ownedRowColumns,
  },
  (table) => [
    check(
      "attachment_exactly_one_owner",
      sql`(
        (case when ${table.consultationId} is null then 0 else 1 end) +
        (case when ${table.prescriptionId} is null then 0 else 1 end) +
        (case when ${table.testResultId} is null then 0 else 1 end)
      ) = 1`,
    ),
  ],
);
