import JSZip from "jszip";
import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { getAllDataForExport } from "@/lib/queries/export";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizePathSegment } from "@/lib/sanitize-path";

export const runtime = "nodejs";

/**
 * On-demand personal data export: a zip containing the full structured
 * record set as JSON, plus every original attached file organized under
 * Case / Consultation folders. This is the user-triggered counterpart to
 * the weekly automated backup — it doubles as a portability guarantee.
 */
export async function GET() {
  const ownerId = await requireUserId();
  const data = await getAllDataForExport(ownerId);
  const supabase = await createSupabaseServerClient();

  const zip = new JSZip();
  zip.file("data.json", JSON.stringify(data, null, 2));

  for (const caseItem of data.cases) {
    const caseFolder = sanitizePathSegment(caseItem.title, caseItem.id);

    for (const consultation of caseItem.consultations) {
      const consultationFolder = `${consultation.date}_${sanitizePathSegment(
        consultation.doctor.name,
        consultation.doctorId,
      )}`;
      const folderPath = `files/${caseFolder}/${consultationFolder}`;

      const allAttachments = [
        ...consultation.attachments,
        ...consultation.prescriptions.flatMap((p) => p.attachments),
        ...consultation.testResults.flatMap((t) => t.attachments),
      ];

      for (const attachment of allAttachments) {
        const { data: fileBlob, error } = await supabase.storage
          .from(process.env.SUPABASE_STORAGE_BUCKET ?? "medical-files")
          .download(attachment.storageKey);

        if (error || !fileBlob) continue;

        const arrayBuffer = await fileBlob.arrayBuffer();
        const shortId = attachment.id.slice(0, 8);
        zip.file(
          `${folderPath}/${shortId}_${attachment.originalFilename}`,
          arrayBuffer,
        );
      }
    }
  }

  const zipBuffer = await zip.generateAsync({ type: "uint8array" });
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(new Blob([new Uint8Array(zipBuffer)]), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="medvault-export-${today}.zip"`,
    },
  });
}
