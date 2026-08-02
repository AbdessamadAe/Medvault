"use server";

import { and, count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { consultations, doctors } from "@/db/schema";
import { doctorSchema } from "@/lib/validation/doctor";
import { requireUserId } from "@/lib/auth";
import { fieldErrorsFrom, type ActionResult } from "./types";

function parseDoctorForm(formData: FormData) {
  return doctorSchema.safeParse({
    name: formData.get("name"),
    specialty: formData.get("specialty"),
    clinic: formData.get("clinic"),
    city: formData.get("city"),
    phone: formData.get("phone"),
    mapsUrl: formData.get("mapsUrl"),
    notes: formData.get("notes"),
  });
}

export async function createDoctor(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const parsed = parseDoctorForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const [created] = await db
    .insert(doctors)
    .values({ ...parsed.data, ownerId })
    .returning({ id: doctors.id });

  revalidatePath("/doctors");
  redirect(`/doctors/${created.id}`);
}

export async function updateDoctor(
  doctorId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const parsed = parseDoctorForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  await db
    .update(doctors)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(doctors.id, doctorId), eq(doctors.ownerId, ownerId)));

  revalidatePath(`/doctors/${doctorId}`);
  revalidatePath("/doctors");
  return { success: true };
}

type InlineDoctorResult =
  | { success: true; doctor: { id: string; name: string; specialty: string | null } }
  | { success: false; error: string };

/**
 * Creates a doctor without redirecting, for the "add a new doctor without
 * leaving this form" flow in ConsultationFormDialog. Only takes the fields
 * that matter in the moment (name, specialty) — clinic/city/phone/notes
 * can be filled in later from the Doctors page.
 */
export async function createDoctorInline(input: {
  name: string;
  specialty?: string;
}): Promise<InlineDoctorResult> {
  const ownerId = await requireUserId();
  const parsed = doctorSchema.safeParse({
    name: input.name,
    specialty: input.specialty,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid doctor",
    };
  }

  const [created] = await db
    .insert(doctors)
    .values({ ...parsed.data, ownerId })
    .returning({ id: doctors.id, name: doctors.name, specialty: doctors.specialty });

  revalidatePath("/doctors");
  return { success: true, doctor: created };
}

export async function deleteDoctor(doctorId: string): Promise<ActionResult> {
  const ownerId = await requireUserId();

  const [{ value: consultationCount }] = await db
    .select({ value: count() })
    .from(consultations)
    .where(and(eq(consultations.doctorId, doctorId), eq(consultations.ownerId, ownerId)));

  if (consultationCount > 0) {
    return {
      success: false,
      error:
        "This doctor has consultations on file and can't be deleted. Delete or reassign those consultations first.",
    };
  }

  await db
    .delete(doctors)
    .where(and(eq(doctors.id, doctorId), eq(doctors.ownerId, ownerId)));

  revalidatePath("/doctors");
  redirect("/doctors");
}
