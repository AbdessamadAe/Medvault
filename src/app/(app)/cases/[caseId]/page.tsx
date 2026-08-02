import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getCaseWithHistory } from "@/lib/queries/cases";
import { listDoctors } from "@/lib/queries/doctors";
import { deleteCase } from "@/lib/actions/cases";
import { CaseFormDialog } from "@/components/cases/case-form-dialog";
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

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const ownerId = await requireUserId();
  const [caseItem, doctors] = await Promise.all([
    getCaseWithHistory(ownerId, caseId),
    listDoctors(ownerId),
  ]);

  if (!caseItem) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{caseItem.title}</h1>
              <Badge>{STATUS_LABEL[caseItem.status]}</Badge>
            </div>
            {(caseItem.startDate || caseItem.endDate) && (
              <p className="text-sm text-muted-foreground">
                {caseItem.startDate ?? "?"} — {caseItem.endDate ?? "present"}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <CaseFormDialog caseItem={caseItem} />
            <DeleteConfirmButton
              action={deleteCase.bind(null, caseItem.id)}
              itemLabel="this case"
              warnAboutChildren
            />
          </div>
        </div>
        {caseItem.notes && <p className="whitespace-pre-wrap text-sm">{caseItem.notes}</p>}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Consultations</h2>
        <ConsultationFormDialog caseId={caseItem.id} doctors={doctors} />
      </div>

      {caseItem.consultations.length === 0 ? (
        <p className="text-muted-foreground">No consultations logged yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {caseItem.consultations.map((consultation) => (
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
