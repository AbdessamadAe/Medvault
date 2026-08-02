"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2Icon } from "lucide-react";
import type { ActionResult } from "@/lib/actions/types";

export function DeleteConfirmButton({
  action,
  itemLabel,
  buttonLabel = "Delete",
  size = "sm",
  warnAboutChildren = false,
}: {
  // Success paths typically redirect() (which throws), so only the failure
  // case ever actually returns a value here.
  action: () => Promise<void | ActionResult>;
  itemLabel: string;
  buttonLabel?: string;
  size?: "sm" | "default";
  warnAboutChildren?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await action();
      if (result && !result.success) {
        toast.error(result.error);
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size={size} />}>
        <Trash2Icon className="size-4" />
        {buttonLabel}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {itemLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            {warnAboutChildren
              ? `This permanently deletes ${itemLabel} and everything linked underneath it, including any attached files. This cannot be undone.`
              : `This permanently deletes ${itemLabel}. This cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
