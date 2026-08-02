import { relations } from "drizzle-orm";
import { cases } from "./cases";
import { doctors } from "./doctors";
import { consultations } from "./consultations";
import { prescriptions } from "./prescriptions";
import { medications } from "./medications";
import { prescriptionMedications } from "./prescription-medications";
import { testResults } from "./test-results";
import { attachments } from "./attachments";

// All relations() calls live in this one leaf file so table-definition files
// never import each other in a cycle — they only import what they need for
// foreign key columns.

export const casesRelations = relations(cases, ({ many }) => ({
  consultations: many(consultations),
}));

export const doctorsRelations = relations(doctors, ({ many }) => ({
  consultations: many(consultations),
}));

export const consultationsRelations = relations(consultations, ({ one, many }) => ({
  case: one(cases, {
    fields: [consultations.caseId],
    references: [cases.id],
  }),
  doctor: one(doctors, {
    fields: [consultations.doctorId],
    references: [doctors.id],
  }),
  prescriptions: many(prescriptions),
  testResults: many(testResults),
  attachments: many(attachments),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one, many }) => ({
  consultation: one(consultations, {
    fields: [prescriptions.consultationId],
    references: [consultations.id],
  }),
  prescriptionMedications: many(prescriptionMedications),
  attachments: many(attachments),
}));

export const medicationsRelations = relations(medications, ({ many }) => ({
  prescriptionMedications: many(prescriptionMedications),
}));

export const prescriptionMedicationsRelations = relations(
  prescriptionMedications,
  ({ one }) => ({
    prescription: one(prescriptions, {
      fields: [prescriptionMedications.prescriptionId],
      references: [prescriptions.id],
    }),
    medication: one(medications, {
      fields: [prescriptionMedications.medicationId],
      references: [medications.id],
    }),
  }),
);

export const testResultsRelations = relations(testResults, ({ one, many }) => ({
  consultation: one(consultations, {
    fields: [testResults.consultationId],
    references: [consultations.id],
  }),
  attachments: many(attachments),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  consultation: one(consultations, {
    fields: [attachments.consultationId],
    references: [consultations.id],
  }),
  prescription: one(prescriptions, {
    fields: [attachments.prescriptionId],
    references: [prescriptions.id],
  }),
  testResult: one(testResults, {
    fields: [attachments.testResultId],
    references: [testResults.id],
  }),
}));
