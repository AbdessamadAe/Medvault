"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DownloadIcon, Trash2Icon } from "lucide-react";
import { getAttachmentDownloadUrl, deleteAttachment } from "@/lib/actions/attachments";

type AttachmentRow = {
  id: string;
  originalFilename: string;
  sizeBytes: number;
  mimeType: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentList({
  attachments,
  consultationId,
}: {
  attachments: AttachmentRow[];
  consultationId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleView(attachmentId: string) {
    startTransition(async () => {
      const url = await getAttachmentDownloadUrl(attachmentId);
      if (!url) {
        toast.error("File no longer available");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  function handleDelete(attachmentId: string) {
    startTransition(() => deleteAttachment(attachmentId, consultationId));
  }

  if (attachments.length === 0) {
    return <p className="text-sm text-muted-foreground">No files attached.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {attachments.map((attachment) => (
        <li
          key={attachment.id}
          className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
        >
          <span className="truncate">
            {attachment.originalFilename}{" "}
            <span className="text-muted-foreground">({formatSize(attachment.sizeBytes)})</span>
          </span>
          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => handleView(attachment.id)}
            >
              <DownloadIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => handleDelete(attachment.id)}
            >
              <Trash2Icon className="size-4 text-destructive" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
