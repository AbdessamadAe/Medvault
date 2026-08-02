"use client";

import { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";
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
import { DatalistInput } from "@/components/datalist-input";
import { createConsultation, updateConsultation } from "@/lib/actions/consultations";
import { createDoctorInline } from "@/lib/actions/doctors";
import { PlusIcon, XIcon } from "lucide-react";
import type { consultations } from "@/db/schema";
import { COMMON_SPECIALTIES } from "@/lib/specialties";

const initialState = { success: false as const, error: "" };

type DoctorOption = { id: string; name: string; specialty: string | null };

export function ConsultationFormDialog({
  caseId,
  doctors,
  reasonSuggestions = [],
  consultation,
}: {
  caseId: string;
  doctors: DoctorOption[];
  reasonSuggestions?: string[];
  consultation?: typeof consultations.$inferSelect;
}) {
  const [open, setOpen] = useState(false);
  const [doctorOptions, setDoctorOptions] = useState<DoctorOption[]>(doctors);
  const [selectedDoctorId, setSelectedDoctorId] = useState(consultation?.doctorId ?? "");
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState("");
  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState("");
  const [isAddingDoctorPending, startAddDoctorTransition] = useTransition();

  const action = consultation
    ? updateConsultation.bind(null, consultation.id, caseId)
    : createConsultation;
  const [state, formAction] = useActionState(action, initialState);

  function handleAddDoctor() {
    const name = newDoctorName.trim();
    if (!name) return;

    startAddDoctorTransition(async () => {
      const result = await createDoctorInline({
        name,
        specialty: newDoctorSpecialty.trim() || undefined,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setDoctorOptions((prev) => [...prev, result.doctor]);
      setSelectedDoctorId(result.doctor.id);
      setIsAddingDoctor(false);
      setNewDoctorName("");
      setNewDoctorSpecialty("");
    });
  }

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
          <input type="hidden" name="doctorId" value={selectedDoctorId} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="doctorId">Doctor</Label>
            <Select
              value={selectedDoctorId}
              onValueChange={(value) => setSelectedDoctorId(value ?? "")}
            >
              <SelectTrigger id="doctorId" className="w-full">
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctorOptions.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                    {doctor.specialty ? ` — ${doctor.specialty}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!isAddingDoctor ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="w-fit px-0"
                onClick={() => setIsAddingDoctor(true)}
              >
                <PlusIcon className="size-4" />
                Add a new doctor
              </Button>
            ) : (
              <div className="flex flex-col gap-2 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">New doctor</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingDoctor(false)}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Doctor name"
                  value={newDoctorName}
                  onChange={(e) => setNewDoctorName(e.target.value)}
                />
                <DatalistInput
                  placeholder="Specialty (optional)"
                  value={newDoctorSpecialty}
                  onChange={(e) => setNewDoctorSpecialty(e.target.value)}
                  options={COMMON_SPECIALTIES}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={!newDoctorName.trim() || isAddingDoctorPending}
                  onClick={handleAddDoctor}
                >
                  Add doctor
                </Button>
                <p className="text-xs text-muted-foreground">
                  You can add clinic, city, and phone later from the Doctors page.
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" defaultValue={consultation?.date} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Reason for visit</Label>
            <DatalistInput
              id="reason"
              name="reason"
              defaultValue={consultation?.reason}
              options={reasonSuggestions}
              required
            />
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
          <SubmitButton className="w-full" disabled={!selectedDoctorId}>
            {consultation ? "Save changes" : "Create consultation"}
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
