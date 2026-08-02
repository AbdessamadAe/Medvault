"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { medications, prescriptionMedications, prescriptions } from "@/db/schema";
import { prescriptionSchema } from "@/lib/validation/prescription";
import { requireUserId } from "@/lib/auth";
import { fieldErrorsFrom, type ActionResult } from "./types";
import { purgeAttachmentsForPrescriptionId } from "./attachment-cascade";

function parsePrescriptionForm(formData: FormData) {
  let parsedMedications: unknown = [];
  const raw = formData.get("medicationsJson");
  if (typeof raw === "string") {
    try {
      parsedMedications = JSON.parse(raw);
    } catch {
      parsedMedications = [];
    }
  }

  return prescriptionSchema.safeParse({
    consultationId: formData.get("consultationId"),
    date: formData.get("date"),
    notes: formData.get("notes"),
    medications: parsedMedications,
  });
}

export async function createPrescription(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const parsed = parsePrescriptionForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const { consultationId, date, notes, medications: medicationInputs } = parsed.data;

  await db.transaction(async (tx) => {
    const [prescription] = await tx
      .insert(prescriptions)
      .values({ consultationId, date, notes, ownerId })
      .returning({ id: prescriptions.id });

    for (const medicationInput of medicationInputs) {
      const [medication] = await tx
        .insert(medications)
        .values({ ...medicationInput, ownerId })
        .returning({ id: medications.id });

      await tx.insert(prescriptionMedications).values({
        prescriptionId: prescription.id,
        medicationId: medication.id,
        ownerId,
      });
    }
  });

  revalidatePath(`/consultations/${consultationId}`);
  redirect(`/consultations/${consultationId}`);
}

export async function updatePrescription(
  prescriptionId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const parsed = parsePrescriptionForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const { consultationId, date, notes, medications: medicationInputs } = parsed.data;

  await db.transaction(async (tx) => {
    const existingLinks = await tx
      .select({ medicationId: prescriptionMedications.medicationId })
      .from(prescriptionMedications)
      .where(eq(prescriptionMedications.prescriptionId, prescriptionId));

    await tx
      .delete(prescriptionMedications)
      .where(eq(prescriptionMedications.prescriptionId, prescriptionId));

    // Our UI only ever creates a medication for exactly one prescription, so
    // the old medication rows can be replaced outright.
    for (const link of existingLinks) {
      await tx
        .delete(medications)
        .where(and(eq(medications.id, link.medicationId), eq(medications.ownerId, ownerId)));
    }

    await tx
      .update(prescriptions)
      .set({ date, notes, updatedAt: new Date() })
      .where(and(eq(prescriptions.id, prescriptionId), eq(prescriptions.ownerId, ownerId)));

    for (const medicationInput of medicationInputs) {
      const [medication] = await tx
        .insert(medications)
        .values({ ...medicationInput, ownerId })
        .returning({ id: medications.id });

      await tx.insert(prescriptionMedications).values({
        prescriptionId,
        medicationId: medication.id,
        ownerId,
      });
    }
  });

  revalidatePath(`/consultations/${consultationId}`);
  return { success: true };
}

export async function deletePrescription(
  prescriptionId: string,
  consultationId: string,
): Promise<void> {
  const ownerId = await requireUserId();

  await purgeAttachmentsForPrescriptionId(ownerId, prescriptionId);

  const linkedMedications = await db
    .select({ medicationId: prescriptionMedications.medicationId })
    .from(prescriptionMedications)
    .where(eq(prescriptionMedications.prescriptionId, prescriptionId));

  await db
    .delete(prescriptions)
    .where(and(eq(prescriptions.id, prescriptionId), eq(prescriptions.ownerId, ownerId)));

  for (const link of linkedMedications) {
    const stillLinked = await db
      .select({ prescriptionId: prescriptionMedications.prescriptionId })
      .from(prescriptionMedications)
      .where(eq(prescriptionMedications.medicationId, link.medicationId))
      .limit(1);

    if (stillLinked.length === 0) {
      await db
        .delete(medications)
        .where(and(eq(medications.id, link.medicationId), eq(medications.ownerId, ownerId)));
    }
  }

  revalidatePath(`/consultations/${consultationId}`);
  redirect(`/consultations/${consultationId}`);
}
