import { describe, expect, it } from "vitest";
import { attachmentFileSchema, MAX_ATTACHMENT_SIZE_BYTES } from "./attachment";

function makeFile(name: string, type: string, sizeBytes: number): File {
  return new File([new Uint8Array(Math.max(sizeBytes, 1))], name, { type });
}

describe("attachmentFileSchema", () => {
  it("accepts an allowed type under the size limit", () => {
    const file = makeFile("report.pdf", "application/pdf", 1024);
    expect(attachmentFileSchema.safeParse(file).success).toBe(true);
  });

  it("rejects a disallowed mime type", () => {
    const file = makeFile("scan.dcm", "application/dicom", 1024);
    expect(attachmentFileSchema.safeParse(file).success).toBe(false);
  });

  it("rejects a file over the size limit", () => {
    const file = makeFile("huge.pdf", "application/pdf", MAX_ATTACHMENT_SIZE_BYTES + 1);
    expect(attachmentFileSchema.safeParse(file).success).toBe(false);
  });

  it("rejects a non-File value", () => {
    expect(attachmentFileSchema.safeParse("not-a-file").success).toBe(false);
    expect(attachmentFileSchema.safeParse(null).success).toBe(false);
  });
});
