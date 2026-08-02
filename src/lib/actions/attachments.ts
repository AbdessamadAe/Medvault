"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { attachments } from "@/db/schema";
import { attachmentFileSchema } from "@/lib/validation/attachment";
import { requireUserId } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  deleteAttachmentFile,
  getAttachmentSignedUrl,
  uploadAttachmentFile,
} from "@/lib/storage";
import { type ActionResult } from "./types";

type AttachmentOwner =
  | { consultationId: string }
  | { prescriptionId: string }
  | { testResultId: string };

async function uploadAttachmentFor(
  owner: AttachmentOwner,
  revalidatePathValue: string,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();

  const parsed = attachmentFileSchema.safeParse(formData.get("file"));
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid file",
    };
  }

  const supabase = await createSupabaseServerClient();
  const uploaded = await uploadAttachmentFile(supabase, ownerId, parsed.data);

  await db.insert(attachments).values({
    ...owner,
    ownerId,
    storageKey: uploaded.storageKey,
    originalFilename: uploaded.originalFilename,
    mimeType: uploaded.mimeType,
    sizeBytes: uploaded.sizeBytes,
  });

  revalidatePath(revalidatePathValue);
  return { success: true };
}

export async function uploadConsultationAttachment(
  consultationId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return uploadAttachmentFor(
    { consultationId },
    `/consultations/${consultationId}`,
    formData,
  );
}

export async function uploadPrescriptionAttachment(
  prescriptionId: string,
  consultationId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return uploadAttachmentFor(
    { prescriptionId },
    `/consultations/${consultationId}`,
    formData,
  );
}

export async function uploadTestResultAttachment(
  testResultId: string,
  consultationId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return uploadAttachmentFor(
    { testResultId },
    `/consultations/${consultationId}`,
    formData,
  );
}

export async function deleteAttachment(
  attachmentId: string,
  consultationId: string,
): Promise<void> {
  const ownerId = await requireUserId();

  const [attachment] = await db
    .select()
    .from(attachments)
    .where(and(eq(attachments.id, attachmentId), eq(attachments.ownerId, ownerId)));

  if (!attachment) return;

  const supabase = await createSupabaseServerClient();
  await deleteAttachmentFile(supabase, attachment.storageKey);

  await db
    .delete(attachments)
    .where(and(eq(attachments.id, attachmentId), eq(attachments.ownerId, ownerId)));

  revalidatePath(`/consultations/${consultationId}`);
}

export async function getAttachmentDownloadUrl(
  attachmentId: string,
): Promise<string | null> {
  const ownerId = await requireUserId();

  const [attachment] = await db
    .select()
    .from(attachments)
    .where(and(eq(attachments.id, attachmentId), eq(attachments.ownerId, ownerId)));

  if (!attachment) return null;

  const supabase = await createSupabaseServerClient();
  return getAttachmentSignedUrl(supabase, attachment.storageKey, attachment.originalFilename);
}
