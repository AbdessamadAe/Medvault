import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { listDoctors } from "@/lib/queries/doctors";
import { DoctorFormDialog } from "@/components/doctors/doctor-form-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DoctorsPage() {
  const ownerId = await requireUserId();
  const doctors = await listDoctors(ownerId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Doctors</h1>
        <DoctorFormDialog />
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
    </div>
  );
}
