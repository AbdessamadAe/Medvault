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
import { createPrescription, updatePrescription } from "@/lib/actions/prescriptions";
import { PlusIcon, XIcon } from "lucide-react";
import { COMMON_FREQUENCIES } from "@/lib/medication-frequencies";

const initialState = { success: false as const, error: "" };

type MedicationRow = {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  notes: string;
};

const emptyMedication: MedicationRow = {
  name: "",
  dosage: "",
  frequency: "",
  startDate: "",
  endDate: "",
  notes: "",
};

type ExistingPrescription = {
  id: string;
  date: string;
  notes: string | null;
  prescriptionMedications: {
    medication: {
      name: string;
      dosage: string | null;
      frequency: string | null;
      startDate: string | null;
      endDate: string | null;
      notes: string | null;
    };
  }[];
};

export function PrescriptionFormDialog({
  consultationId,
  medicationNameSuggestions = [],
  prescription,
}: {
  consultationId: string;
  medicationNameSuggestions?: string[];
  prescription?: ExistingPrescription;
}) {
  const [open, setOpen] = useState(false);
  const [medications, setMedications] = useState<MedicationRow[]>(
    prescription
      ? prescription.prescriptionMedications.map((link) => ({
          name: link.medication.name,
          dosage: link.medication.dosage ?? "",
          frequency: link.medication.frequency ?? "",
          startDate: link.medication.startDate ?? "",
          endDate: link.medication.endDate ?? "",
          notes: link.medication.notes ?? "",
        }))
      : [{ ...emptyMedication }],
  );

  const action = prescription
    ? updatePrescription.bind(null, prescription.id)
    : createPrescription;
  const [state, formAction] = useActionState(action, initialState);

  function updateMedication(index: number, field: keyof MedicationRow, value: string) {
    setMedications((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={prescription ? "outline" : "default"} size="sm" />}>
        {!prescription && <PlusIcon className="size-4" />}
        {prescription ? "Edit" : "Add prescription"}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{prescription ? "Edit prescription" : "Add prescription"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="consultationId" value={consultationId} />
          <input type="hidden" name="medicationsJson" value={JSON.stringify(medications)} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" defaultValue={prescription?.date} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Medications</Label>
            {medications.map((row, index) => (
              <div key={index} className="flex flex-col gap-2 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Medication {index + 1}
                  </span>
                  {medications.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setMedications((rows) => rows.filter((_, i) => i !== index))
                      }
                    >
                      <XIcon className="size-4" />
                    </Button>
                  )}
                </div>
                <DatalistInput
                  placeholder="Name"
                  value={row.name}
                  onChange={(e) => updateMedication(index, "name", e.target.value)}
                  options={medicationNameSuggestions}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Dosage (e.g. 500mg)"
                    value={row.dosage}
                    onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                  />
                  <DatalistInput
                    placeholder="Frequency (e.g. 2x/day)"
                    value={row.frequency}
                    onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                    options={COMMON_FREQUENCIES}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    aria-label="Start date"
                    value={row.startDate}
                    onChange={(e) => updateMedication(index, "startDate", e.target.value)}
                  />
                  <Input
                    type="date"
                    aria-label="End date"
                    value={row.endDate}
                    onChange={(e) => updateMedication(index, "endDate", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMedications((rows) => [...rows, { ...emptyMedication }])}
            >
              <PlusIcon className="size-4" />
              Add another medication
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={prescription?.notes ?? undefined}
              rows={3}
            />
          </div>

          {!state.success && state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <SubmitButton className="w-full">
            {prescription ? "Save changes" : "Add prescription"}
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
