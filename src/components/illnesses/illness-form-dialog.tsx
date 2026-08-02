"use client";

import { useActionState, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/submit-button";
import { createIllness, updateIllness } from "@/lib/actions/illnesses";
import { PlusIcon } from "lucide-react";
import type { illnesses } from "@/db/schema";

const initialState = { success: false as const, error: "" };

export function IllnessFormDialog({
  illness,
}: {
  illness?: typeof illnesses.$inferSelect;
}) {
  const [open, setOpen] = useState(false);
  const action = illness ? updateIllness.bind(null, illness.id) : createIllness;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant={illness ? "outline" : "default"} size={illness ? "sm" : "default"} />}
      >
        {!illness && <PlusIcon className="size-4" />}
        {illness ? "Edit" : "New illness"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{illness ? "Edit illness" : "New illness"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={illness?.title} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={illness?.status ?? "active"}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="chronic">Chronic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={illness?.startDate ?? undefined}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={illness?.endDate ?? undefined}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={illness?.notes ?? undefined} rows={4} />
          </div>
          {!state.success && state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <SubmitButton className="w-full">{illness ? "Save changes" : "Create illness"}</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
