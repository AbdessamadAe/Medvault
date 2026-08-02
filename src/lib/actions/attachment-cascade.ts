import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { attachments, consultations, prescriptions, testResults } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteAttachmentFile } from "@/lib/storage";

/**
 * Deleting an Illness/Consultation/Prescription/Test Result cascades at the
 * database level, but that only removes rows — it does nothing to the
 * actual files sitting in Supabase Storage. Call one of these BEFORE the
 * database delete so files never get orphaned.
 */

async function purgeByStorageKeys(storageKeys: string[]) {
  if (storageKeys.length === 0) return;
  const supabase = await createSupabaseServerClient();
  for (const storageKey of storageKeys) {
    await deleteAttachmentFile(supabase, storageKey);
  }
}

export async function purgeAttachmentsForConsultationIds(
  ownerId: string,
  consultationIds: string[],
) {
  if (consultationIds.length === 0) return;

  const prescriptionRows = await db
    .select({ id: prescriptions.id })
    .from(prescriptions)
    .where(
      and(
        inArray(prescriptions.consultationId, consultationIds),
        eq(prescriptions.ownerId, ownerId),
      ),
    );
  const prescriptionIds = prescriptionRows.map((row) => row.id);

  const testResultRows = await db
    .select({ id: testResults.id })
    .from(testResults)
    .where(
      and(
        inArray(testResults.consultationId, consultationIds),
        eq(testResults.ownerId, ownerId),
      ),
    );
  const testResultIds = testResultRows.map((row) => row.id);

  const ownerConditions = [inArray(attachments.consultationId, consultationIds)];
  if (prescriptionIds.length > 0) {
    ownerConditions.push(inArray(attachments.prescriptionId, prescriptionIds));
  }
  if (testResultIds.length > 0) {
    ownerConditions.push(inArray(attachments.testResultId, testResultIds));
  }

  const attachmentRows = await db
    .select({ storageKey: attachments.storageKey })
    .from(attachments)
    .where(and(eq(attachments.ownerId, ownerId), or(...ownerConditions)));

  await purgeByStorageKeys(attachmentRows.map((row) => row.storageKey));
}

export async function purgeAttachmentsForIllness(ownerId: string, illnessId: string) {
  const consultationRows = await db
    .select({ id: consultations.id })
    .from(consultations)
    .where(and(eq(consultations.illnessId, illnessId), eq(consultations.ownerId, ownerId)));

  await purgeAttachmentsForConsultationIds(
    ownerId,
    consultationRows.map((row) => row.id),
  );
}

export async function purgeAttachmentsForPrescriptionId(
  ownerId: string,
  prescriptionId: string,
) {
  const rows = await db
    .select({ storageKey: attachments.storageKey })
    .from(attachments)
    .where(and(eq(attachments.prescriptionId, prescriptionId), eq(attachments.ownerId, ownerId)));

  await purgeByStorageKeys(rows.map((row) => row.storageKey));
}

export async function purgeAttachmentsForTestResultId(
  ownerId: string,
  testResultId: string,
) {
  const rows = await db
    .select({ storageKey: attachments.storageKey })
    .from(attachments)
    .where(and(eq(attachments.testResultId, testResultId), eq(attachments.ownerId, ownerId)));

  await purgeByStorageKeys(rows.map((row) => row.storageKey));
}
