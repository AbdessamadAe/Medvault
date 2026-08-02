import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { illnesses } from "@/db/schema";

export async function listIllnesses(ownerId: string) {
  return db.query.illnesses.findMany({
    where: eq(illnesses.ownerId, ownerId),
    orderBy: [desc(illnesses.updatedAt)],
  });
}

export async function getIllnessWithHistory(ownerId: string, illnessId: string) {
  return db.query.illnesses.findFirst({
    where: and(eq(illnesses.id, illnessId), eq(illnesses.ownerId, ownerId)),
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

export async function listIllnessesForPicker(ownerId: string) {
  return db.query.illnesses.findMany({
    where: eq(illnesses.ownerId, ownerId),
    orderBy: (illnesses, { asc }) => [asc(illnesses.title)],
    columns: { id: true, title: true },
  });
}
