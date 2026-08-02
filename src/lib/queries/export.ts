import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cases, doctors } from "@/db/schema";

export async function getAllDataForExport(ownerId: string) {
  const [caseRows, doctorRows] = await Promise.all([
    db.query.cases.findMany({
      where: eq(cases.ownerId, ownerId),
      with: {
        consultations: {
          with: {
            doctor: true,
            prescriptions: {
              with: {
                prescriptionMedications: { with: { medication: true } },
                attachments: true,
              },
            },
            testResults: { with: { attachments: true } },
            attachments: true,
          },
        },
      },
    }),
    db.query.doctors.findMany({ where: eq(doctors.ownerId, ownerId) }),
  ]);

  return { cases: caseRows, doctors: doctorRows };
}
