import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { consultations, doctors, illnesses, testResults } from "@/db/schema";

export type SearchResult = {
  type: "illness" | "doctor" | "consultation" | "test-result";
  id: string;
  title: string;
  href: string;
};

export async function searchRecords(ownerId: string, term: string): Promise<SearchResult[]> {
  const pattern = `%${term}%`;

  const [illnessRows, doctorRows, consultationRows, testResultRows] = await Promise.all([
    db
      .select({ id: illnesses.id, title: illnesses.title })
      .from(illnesses)
      .where(
        and(
          eq(illnesses.ownerId, ownerId),
          or(ilike(illnesses.title, pattern), ilike(illnesses.notes, pattern)),
        ),
      ),
    db
      .select({ id: doctors.id, name: doctors.name })
      .from(doctors)
      .where(
        and(
          eq(doctors.ownerId, ownerId),
          or(ilike(doctors.name, pattern), ilike(doctors.notes, pattern)),
        ),
      ),
    db
      .select({ id: consultations.id, reason: consultations.reason })
      .from(consultations)
      .where(
        and(
          eq(consultations.ownerId, ownerId),
          or(ilike(consultations.reason, pattern), ilike(consultations.notes, pattern)),
        ),
      ),
    db
      .select({
        id: testResults.id,
        consultationId: testResults.consultationId,
        testName: testResults.testName,
      })
      .from(testResults)
      .where(
        and(
          eq(testResults.ownerId, ownerId),
          or(
            ilike(testResults.testName, pattern),
            ilike(testResults.resultNotes, pattern),
          ),
        ),
      ),
  ]);

  return [
    ...illnessRows.map((row) => ({
      type: "illness" as const,
      id: row.id,
      title: row.title,
      href: `/illnesses/${row.id}`,
    })),
    ...doctorRows.map((row) => ({
      type: "doctor" as const,
      id: row.id,
      title: row.name,
      href: `/doctors/${row.id}`,
    })),
    ...consultationRows.map((row) => ({
      type: "consultation" as const,
      id: row.id,
      title: row.reason,
      href: `/consultations/${row.id}`,
    })),
    ...testResultRows.map((row) => ({
      type: "test-result" as const,
      id: row.id,
      title: row.testName,
      href: `/consultations/${row.consultationId}`,
    })),
  ];
}
