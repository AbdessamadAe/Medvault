import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getConsultationWithDetails } from "@/lib/queries/consultations";
import { listDoctors } from "@/lib/queries/doctors";
import { deleteConsultation } from "@/lib/actions/consultations";
import { deletePrescription } from "@/lib/actions/prescriptions";
import { deleteTestResult } from "@/lib/actions/test-results";
import {
  uploadConsultationAttachment,
  uploadPrescriptionAttachment,
  uploadTestResultAttachment,
} from "@/lib/actions/attachments";
import { ConsultationFormDialog } from "@/components/consultations/consultation-form-dialog";
import { PrescriptionFormDialog } from "@/components/prescriptions/prescription-form-dialog";
import { TestResultFormDialog } from "@/components/test-results/test-result-form-dialog";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { AttachmentUploader } from "@/components/attachments/attachment-uploader";
import { AttachmentList } from "@/components/attachments/attachment-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ consultationId: string }>;
}) {
  const { consultationId } = await params;
  const ownerId = await requireUserId();
  const [consultation, doctors] = await Promise.all([
    getConsultationWithDetails(ownerId, consultationId),
    listDoctors(ownerId),
  ]);

  if (!consultation) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/illnesses/${consultation.illnessId}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← {consultation.illness.title}
          </Link>
          <h1 className="text-2xl font-semibold">{consultation.reason}</h1>
          <p className="text-sm text-muted-foreground">
            {consultation.date} · Dr. {consultation.doctor.name}
          </p>
        </div>
        <div className="flex gap-2">
          <ConsultationFormDialog
            illnessId={consultation.illnessId}
            doctors={doctors}
            consultation={consultation}
          />
          <DeleteConfirmButton
            action={deleteConsultation.bind(null, consultation.id, consultation.illnessId)}
            itemLabel="this consultation"
            warnAboutChildren
          />
        </div>
      </div>
      {consultation.notes && <p className="whitespace-pre-wrap text-sm">{consultation.notes}</p>}

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Visit attachments</h3>
        <AttachmentList attachments={consultation.attachments} consultationId={consultation.id} />
        <AttachmentUploader action={uploadConsultationAttachment.bind(null, consultation.id)} />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Prescriptions</h2>
        <PrescriptionFormDialog consultationId={consultation.id} />
      </div>
      {consultation.prescriptions.length === 0 ? (
        <p className="text-muted-foreground">No prescriptions logged for this visit.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {consultation.prescriptions.map((prescription) => (
            <Card key={prescription.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{prescription.date}</CardTitle>
                  <div className="flex gap-2">
                    <PrescriptionFormDialog
                      consultationId={consultation.id}
                      prescription={prescription}
                    />
                    <DeleteConfirmButton
                      action={deletePrescription.bind(null, prescription.id, consultation.id)}
                      itemLabel="this prescription"
                      warnAboutChildren
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {prescription.prescriptionMedications.map((link) => (
                    <Badge key={link.medication.id} variant="secondary">
                      {link.medication.name}
                      {link.medication.dosage ? ` · ${link.medication.dosage}` : ""}
                      {link.medication.frequency ? ` · ${link.medication.frequency}` : ""}
                    </Badge>
                  ))}
                </div>
                {prescription.notes && <p className="text-sm">{prescription.notes}</p>}
                <AttachmentList
                  attachments={prescription.attachments}
                  consultationId={consultation.id}
                />
                <AttachmentUploader
                  action={uploadPrescriptionAttachment.bind(
                    null,
                    prescription.id,
                    consultation.id,
                  )}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Test results</h2>
        <TestResultFormDialog consultationId={consultation.id} />
      </div>
      {consultation.testResults.length === 0 ? (
        <p className="text-muted-foreground">No test results logged for this visit.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {consultation.testResults.map((testResult) => (
            <Card key={testResult.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{testResult.testName}</CardTitle>
                    <Badge variant="outline">
                      {testResult.type === "lab" ? "Lab" : "Imaging"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <TestResultFormDialog
                      consultationId={consultation.id}
                      testResult={testResult}
                    />
                    <DeleteConfirmButton
                      action={deleteTestResult.bind(null, testResult.id, consultation.id)}
                      itemLabel="this test result"
                      warnAboutChildren
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <span className="text-sm text-muted-foreground">{testResult.date}</span>
                {testResult.resultNotes && <p className="text-sm">{testResult.resultNotes}</p>}
                <AttachmentList
                  attachments={testResult.attachments}
                  consultationId={consultation.id}
                />
                <AttachmentUploader
                  action={uploadTestResultAttachment.bind(
                    null,
                    testResult.id,
                    consultation.id,
                  )}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
