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
import { SubmitButton } from "@/components/submit-button";
import { DatalistInput } from "@/components/datalist-input";
import { createDoctor, updateDoctor } from "@/lib/actions/doctors";
import { PlusIcon } from "lucide-react";
import type { doctors } from "@/db/schema";
import { COMMON_SPECIALTIES } from "@/lib/specialties";

const initialState = { success: false as const, error: "" };

export function DoctorFormDialog({
  doctor,
  clinicSuggestions = [],
  citySuggestions = [],
}: {
  doctor?: typeof doctors.$inferSelect;
  clinicSuggestions?: string[];
  citySuggestions?: string[];
}) {
  const [open, setOpen] = useState(false);
  const action = doctor ? updateDoctor.bind(null, doctor.id) : createDoctor;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant={doctor ? "outline" : "default"} size={doctor ? "sm" : "default"} />}
      >
        {!doctor && <PlusIcon className="size-4" />}
        {doctor ? "Edit" : "New doctor"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{doctor ? "Edit doctor" : "New doctor"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={doctor?.name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="specialty">Specialty</Label>
              <DatalistInput
                id="specialty"
                name="specialty"
                defaultValue={doctor?.specialty ?? undefined}
                options={COMMON_SPECIALTIES}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="clinic">Clinic / Hospital</Label>
              <DatalistInput
                id="clinic"
                name="clinic"
                defaultValue={doctor?.clinic ?? undefined}
                options={clinicSuggestions}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">City</Label>
              <DatalistInput
                id="city"
                name="city"
                defaultValue={doctor?.city ?? undefined}
                options={citySuggestions}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={doctor?.phone ?? undefined} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={doctor?.notes ?? undefined} rows={4} />
          </div>
          {!state.success && state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <SubmitButton className="w-full">{doctor ? "Save changes" : "Create doctor"}</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
