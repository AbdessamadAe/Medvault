import Link from "next/link";
import { Suspense } from "react";
import { requireUserId } from "@/lib/auth";
import { listDoctors } from "@/lib/queries/doctors";
import { getDoctorFieldSuggestions } from "@/lib/queries/suggestions";
import { DoctorFormDialog } from "@/components/doctors/doctor-form-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// The "New doctor" button needs clinic/city suggestions (a DB query), so
// unlike the Cases page it can't be fully instant — it's bundled here with
// the grid. Only the "Doctors" heading itself is truly data-free (see
// DoctorsPage below, which renders it outside this Suspense boundary).
async function DoctorsResults() {
  const ownerId = await requireUserId();
  const [doctors, suggestions] = await Promise.all([
    listDoctors(ownerId),
    getDoctorFieldSuggestions(ownerId),
  ]);

  return (
    <>
      <div className="flex justify-end">
        <DoctorFormDialog
          clinicSuggestions={suggestions.clinics}
          citySuggestions={suggestions.cities}
        />
      </div>
      {doctors.length === 0 ? (
        <p className="text-muted-foreground">No doctors yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {doctors.map((doctor) => (
            <Link key={doctor.id} href={`/doctors/${doctor.id}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-lg">{doctor.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {[doctor.specialty, doctor.clinic, doctor.city].filter(Boolean).join(" · ")}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

function DoctorsResultsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Doctors</h1>
      <Suspense fallback={<DoctorsResultsSkeleton />}>
        <DoctorsResults />
      </Suspense>
    </div>
  );
}
