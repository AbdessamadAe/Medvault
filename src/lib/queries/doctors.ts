import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { doctors } from "@/db/schema";

export async function listDoctors(ownerId: string) {
  return db.query.doctors.findMany({
    where: eq(doctors.ownerId, ownerId),
    orderBy: (doctors, { asc }) => [asc(doctors.name)],
  });
}

export async function getDoctorWithHistory(ownerId: string, doctorId: string) {
  return db.query.doctors.findFirst({
    where: and(eq(doctors.id, doctorId), eq(doctors.ownerId, ownerId)),
    with: {
      consultations: {
        orderBy: (consultations, { desc }) => [desc(consultations.date)],
        with: { case: true },
      },
    },
  });
}
