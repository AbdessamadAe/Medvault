import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "medical-files";
const SIGNED_URL_TTL_SECONDS = 60;

/**
 * Uploads a file to the private storage bucket under a random,
 * non-identifying key (never the original filename) inside the owning
 * user's folder, matching the bucket's
 * `(storage.foldername(name))[1] = auth.uid()::text` policy.
 */
export async function uploadAttachmentFile(
  supabase: SupabaseClient,
  ownerId: string,
  file: File,
) {
  const storageKey = `${ownerId}/${randomUUID()}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storageKey, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return {
    storageKey,
    mimeType: file.type,
    sizeBytes: file.size,
    originalFilename: file.name,
  };
}

/**
 * Short-lived (60s) signed URL so a file is never reachable via a
 * permanent or guessable link. Forces the browser to download/display
 * using the original filename rather than the random storage key.
 */
export async function getAttachmentSignedUrl(
  supabase: SupabaseClient,
  storageKey: string,
  originalFilename: string,
) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storageKey, SIGNED_URL_TTL_SECONDS, {
      download: originalFilename,
    });

  if (error || !data) {
    throw new Error(`Failed to create signed URL: ${error?.message}`);
  }

  return data.signedUrl;
}

export async function deleteAttachmentFile(
  supabase: SupabaseClient,
  storageKey: string,
) {
  const { error } = await supabase.storage.from(BUCKET).remove([storageKey]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}
