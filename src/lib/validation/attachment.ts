import { z } from "zod";

export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "text/plain",
] as const;

export const MAX_ATTACHMENT_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export const attachmentFileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "File is empty")
  .refine(
    (file) => file.size <= MAX_ATTACHMENT_SIZE_BYTES,
    "File must be 25MB or smaller",
  )
  .refine(
    (file) =>
      ALLOWED_ATTACHMENT_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_ATTACHMENT_MIME_TYPES)[number],
      ),
    "Unsupported file type — use PDF, JPEG, PNG, HEIC, or plain text",
  );
