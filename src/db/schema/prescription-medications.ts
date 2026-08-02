import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { ownedRowColumns } from "./columns.helpers";
import { prescriptions } from "./prescriptions";
import { medications } from "./medications";

export const prescriptionMedications = pgTable(
  "prescription_medications",
  {
    prescriptionId: uuid("prescription_id")
      .notNull()
      .references(() => prescriptions.id, { onDelete: "cascade" }),
    medicationId: uuid("medication_id")
      .notNull()
      .references(() => medications.id, { onDelete: "restrict" }),
    ...ownedRowColumns,
  },
  (table) => [primaryKey({ columns: [table.prescriptionId, table.medicationId] })],
);
