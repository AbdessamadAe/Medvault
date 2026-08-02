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
import { createConsultation, updateConsultation } from "@/lib/actions/consultations";
import { PlusIcon } from "lucide-react";
import type { consultations } from "@/db/schema";

const initialState = { success: false as const, error: "" };

export function ConsultationFormDialog({
  caseId,
  doctors,
  consultation,
}: {
  caseId: string;
  doctors: { id: string; name: string; specialty: string | null }[];
  consultation?: typeof consultations.$inferSelect;
}) {
  const [open, setOpen] = useState(false);
  const action = consultation
    ? updateConsultation.bind(null, consultation.id, caseId)
    : createConsultation;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={consultation ? "outline" : "default"} size={consultation ? "sm" : "default"} />
        }
      >
        {!consultation && <PlusIcon className="size-4" />}
        {consultation ? "Edit" : "New consultation"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{consultation ? "Edit consultation" : "New consultation"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="caseId" value={caseId} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="doctorId">Doctor</Label>
            <Select name="doctorId" defaultValue={consultation?.doctorId}>
              <SelectTrigger id="doctorId" className="w-full">
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                    {doctor.specialty ? ` — ${doctor.specialty}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {doctors.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Add a doctor first from the Doctors page.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" defaultValue={consultation?.date} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Reason for visit</Label>
            <Input id="reason" name="reason" defaultValue={consultation?.reason} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={consultation?.notes ?? undefined}
              rows={4}
            />
          </div>
          {!state.success && state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <SubmitButton className="w-full" disabled={doctors.length === 0}>
            {consultation ? "Save changes" : "Create consultation"}
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
