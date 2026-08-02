"use client";

import { useActionState, useRef } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import type { ActionResult } from "@/lib/actions/types";

const initialState: ActionResult = { success: false, error: "" };

export function AttachmentUploader({
  action,
}: {
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  async function wrappedAction(prevState: ActionResult, formData: FormData) {
    const result = await action(prevState, formData);
    if (result.success) {
      toast.success("File uploaded");
      formRef.current?.reset();
    }
    return result;
  }

  const [state, formAction] = useActionState(wrappedAction, initialState);

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-2">
      <Input
        type="file"
        name="file"
        required
        accept=".pdf,.jpg,.jpeg,.png,.heic,.txt"
        className="max-w-xs"
      />
      <SubmitButton size="sm" variant="outline">
        Upload
      </SubmitButton>
      {!state.success && state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
