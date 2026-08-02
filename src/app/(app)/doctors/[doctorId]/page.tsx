import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getDoctorWithHistory } from "@/lib/queries/doctors";
import { getDoctorFieldSuggestions } from "@/lib/queries/suggestions";
import { deleteDoctor } from "@/lib/actions/doctors";
import { DoctorFormDialog } from "@/components/doctors/doctor-form-dialog";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPinIcon } from "lucide-react";

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = await params;
  const ownerId = await requireUserId();
  const [doctor, suggestions] = await Promise.all([
    getDoctorWithHistory(ownerId, doctorId),
    getDoctorFieldSuggestions(ownerId),
  ]);

  if (!doctor) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{doctor.name}</h1>
          <p className="text-sm text-muted-foreground">
            {[doctor.specialty, doctor.clinic, doctor.city, doctor.phone]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {doctor.mapsUrl && (
            <a
              href={doctor.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <MapPinIcon className="size-3.5" />
              View on Google Maps
            </a>
          )}
        </div>
        <div className="flex gap-2">
          <DoctorFormDialog
            doctor={doctor}
            clinicSuggestions={suggestions.clinics}
            citySuggestions={suggestions.cities}
          />
          <DeleteConfirmButton action={deleteDoctor.bind(null, doctor.id)} itemLabel="this doctor" />
        </div>
      </div>
      {doctor.notes && <p className="whitespace-pre-wrap text-sm">{doctor.notes}</p>}

      <Separator />

      <h2 className="text-lg font-semibold">Consultation history</h2>
      {doctor.consultations.length === 0 ? (
        <p className="text-muted-foreground">No consultations with this doctor yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {doctor.consultations.map((consultation) => (
            <Link key={consultation.id} href={`/consultations/${consultation.id}`}>
              <Card className="transition-colors hover:border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{consultation.reason}</CardTitle>
                    <span className="text-sm text-muted-foreground">{consultation.date}</span>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  For {consultation.case.title}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
