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
import { SubmitButton } from "@/components/submit-button";
import { DatalistInput } from "@/components/datalist-input";
import { createDoctor, updateDoctor } from "@/lib/actions/doctors";
import { lookupGoogleMapsLink } from "@/lib/actions/maps-lookup";
import { MapPinIcon, PlusIcon } from "lucide-react";
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
  const [clinic, setClinic] = useState(doctor?.clinic ?? "");
  const [city, setCity] = useState(doctor?.city ?? "");
  const [mapsUrl, setMapsUrl] = useState("");
  const [isLookingUpMaps, startMapsLookup] = useTransition();

  const action = doctor ? updateDoctor.bind(null, doctor.id) : createDoctor;
  const [state, formAction] = useActionState(action, initialState);

  function handleMapsLookup() {
    if (!mapsUrl.trim()) return;

    startMapsLookup(async () => {
      const result = await lookupGoogleMapsLink(mapsUrl.trim());

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (result.name) setClinic(result.name);
      if (result.city) setCity(result.city);
      if (!result.name && !result.city) {
        toast.error("Found the link, but couldn't extract a name or city from it");
      } else {
        toast.success("Filled in clinic/city from the map link — double-check them below");
      }
    });
  }

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

        <div className="flex flex-col gap-2 rounded-md border p-3">
          <Label htmlFor="mapsUrl" className="text-xs text-muted-foreground">
            Paste a Google Maps link to fill in clinic &amp; city (optional)
          </Label>
          <div className="flex gap-2">
            <Input
              id="mapsUrl"
              placeholder="https://maps.app.goo.gl/..."
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!mapsUrl.trim() || isLookingUpMaps}
              onClick={handleMapsLookup}
            >
              <MapPinIcon className="size-4" />
              Fill in
            </Button>
          </div>
        </div>

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
                value={clinic}
                onChange={(e) => setClinic(e.target.value)}
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
                value={city}
                onChange={(e) => setCity(e.target.value)}
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
