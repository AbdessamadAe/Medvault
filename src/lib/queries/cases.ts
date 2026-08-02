import { and, arrayContains, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cases } from "@/db/schema";
import type { BodySystem } from "@/lib/body-systems";

export async function listCases(ownerId: string, bodySystem?: BodySystem) {
  return db.query.cases.findMany({
    where: and(
      eq(cases.ownerId, ownerId),
      bodySystem ? arrayContains(cases.bodySystems, [bodySystem]) : undefined,
    ),
    orderBy: [desc(cases.updatedAt)],
  });
}

export async function getCaseWithHistory(ownerId: string, caseId: string) {
  return db.query.cases.findFirst({
    where: and(eq(cases.id, caseId), eq(cases.ownerId, ownerId)),
    with: {
      consultations: {
        orderBy: (consultations, { desc }) => [desc(consultations.date)],
        with: {
          doctor: true,
          prescriptions: {
            with: {
              prescriptionMedications: { with: { medication: true } },
              attachments: true,
            },
          },
          testResults: {
            with: { attachments: true },
          },
          attachments: true,
        },
      },
    },
  });
}

export async function listCasesForPicker(ownerId: string) {
  return db.query.cases.findMany({
    where: eq(cases.ownerId, ownerId),
    orderBy: (cases, { asc }) => [asc(cases.title)],
    columns: { id: true, title: true },
  });
}
