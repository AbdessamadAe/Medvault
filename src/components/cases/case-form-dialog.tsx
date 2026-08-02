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
import { createCase, updateCase } from "@/lib/actions/cases";
import { PlusIcon } from "lucide-react";
import type { cases } from "@/db/schema";
import { BODY_SYSTEM_LABELS, BODY_SYSTEM_VALUES } from "@/lib/body-systems";

const initialState = { success: false as const, error: "" };

export function CaseFormDialog({
  caseItem,
}: {
  caseItem?: typeof cases.$inferSelect;
}) {
  const [open, setOpen] = useState(false);
  const action = caseItem ? updateCase.bind(null, caseItem.id) : createCase;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant={caseItem ? "outline" : "default"} size={caseItem ? "sm" : "default"} />}
      >
        {!caseItem && <PlusIcon className="size-4" />}
        {caseItem ? "Edit" : "New case"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{caseItem ? "Edit case" : "New case"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={caseItem?.title} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={caseItem?.status ?? "active"}>
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
                defaultValue={caseItem?.startDate ?? undefined}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={caseItem?.endDate ?? undefined}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Body systems (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {BODY_SYSTEM_VALUES.map((value) => (
                <label key={value} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="bodySystems"
                    value={value}
                    defaultChecked={caseItem?.bodySystems?.includes(value)}
                    className="peer sr-only"
                  />
                  <span className="rounded-full border px-3 py-1 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground hover:bg-accent">
                    {BODY_SYSTEM_LABELS[value]}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={caseItem?.notes ?? undefined} rows={4} />
          </div>
          {!state.success && state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <SubmitButton className="w-full">{caseItem ? "Save changes" : "Create case"}</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
