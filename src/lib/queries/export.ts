import { eq } from "drizzle-orm";
import { db } from "@/db";
import { doctors, illnesses } from "@/db/schema";

export async function getAllDataForExport(ownerId: string) {
  const [illnessRows, doctorRows] = await Promise.all([
    db.query.illnesses.findMany({
      where: eq(illnesses.ownerId, ownerId),
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

  return { illnesses: illnessRows, doctors: doctorRows };
}
