import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getIllnessWithHistory } from "@/lib/queries/illnesses";
import { listDoctors } from "@/lib/queries/doctors";
import { deleteIllness } from "@/lib/actions/illnesses";
import { IllnessFormDialog } from "@/components/illnesses/illness-form-dialog";
import { ConsultationFormDialog } from "@/components/consultations/consultation-form-dialog";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  resolved: "Resolved",
  chronic: "Chronic",
};

export default async function IllnessDetailPage({
  params,
}: {
  params: Promise<{ illnessId: string }>;
}) {
  const { illnessId } = await params;
  const ownerId = await requireUserId();
  const [illness, doctors] = await Promise.all([
    getIllnessWithHistory(ownerId, illnessId),
    listDoctors(ownerId),
  ]);

  if (!illness) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{illness.title}</h1>
              <Badge>{STATUS_LABEL[illness.status]}</Badge>
            </div>
            {(illness.startDate || illness.endDate) && (
              <p className="text-sm text-muted-foreground">
                {illness.startDate ?? "?"} — {illness.endDate ?? "present"}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <IllnessFormDialog illness={illness} />
            <DeleteConfirmButton
              action={deleteIllness.bind(null, illness.id)}
              itemLabel="this illness"
              warnAboutChildren
            />
          </div>
        </div>
        {illness.notes && <p className="whitespace-pre-wrap text-sm">{illness.notes}</p>}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Consultations</h2>
        <ConsultationFormDialog illnessId={illness.id} doctors={doctors} />
      </div>

      {illness.consultations.length === 0 ? (
        <p className="text-muted-foreground">No consultations logged yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {illness.consultations.map((consultation) => (
            <Link key={consultation.id} href={`/consultations/${consultation.id}`}>
              <Card className="transition-colors hover:border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{consultation.reason}</CardTitle>
                    <span className="text-sm text-muted-foreground">{consultation.date}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>Dr. {consultation.doctor.name}</span>
                  <span>{consultation.prescriptions.length} prescription(s)</span>
                  <span>{consultation.testResults.length} test result(s)</span>
                  <span>{consultation.attachments.length} attachment(s)</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
