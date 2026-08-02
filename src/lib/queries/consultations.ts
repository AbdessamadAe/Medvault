import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { consultations } from "@/db/schema";

export async function getConsultationWithDetails(ownerId: string, consultationId: string) {
  return db.query.consultations.findFirst({
    where: and(eq(consultations.id, consultationId), eq(consultations.ownerId, ownerId)),
    with: {
      case: true,
      doctor: true,
      prescriptions: {
        orderBy: (prescriptions, { desc }) => [desc(prescriptions.date)],
        with: {
          prescriptionMedications: { with: { medication: true } },
          attachments: true,
        },
      },
      testResults: {
        orderBy: (testResults, { desc }) => [desc(testResults.date)],
        with: { attachments: true },
      },
      attachments: true,
    },
  });
}
