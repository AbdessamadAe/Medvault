import { eq } from "drizzle-orm";
import { db } from "@/db";
import { consultations, doctors, medications, testResults } from "@/db/schema";

/**
 * Distinct values the user has already typed for a given field, used to
 * power <datalist> suggestions. There's no fixed vocabulary for these
 * fields (clinic names, test names, ...) — the best low-friction dropdown
 * is "things I've already typed before."
 */

function distinctNonEmpty(values: (string | null)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort();
}

export async function getDoctorFieldSuggestions(ownerId: string) {
  const rows = await db
    .selectDistinct({ clinic: doctors.clinic, city: doctors.city })
    .from(doctors)
    .where(eq(doctors.ownerId, ownerId));

  return {
    clinics: distinctNonEmpty(rows.map((row) => row.clinic)),
    cities: distinctNonEmpty(rows.map((row) => row.city)),
  };
}

export async function getConsultationReasonSuggestions(ownerId: string) {
  const rows = await db
    .selectDistinct({ reason: consultations.reason })
    .from(consultations)
    .where(eq(consultations.ownerId, ownerId));

  return distinctNonEmpty(rows.map((row) => row.reason));
}

export async function getMedicationNameSuggestions(ownerId: string) {
  const rows = await db
    .selectDistinct({ name: medications.name })
    .from(medications)
    .where(eq(medications.ownerId, ownerId));

  return distinctNonEmpty(rows.map((row) => row.name));
}

export async function getTestNameSuggestions(ownerId: string) {
  const rows = await db
    .selectDistinct({ testName: testResults.testName })
    .from(testResults)
    .where(eq(testResults.ownerId, ownerId));

  return distinctNonEmpty(rows.map((row) => row.testName));
}
