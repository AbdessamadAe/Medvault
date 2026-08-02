import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { listIllnesses } from "@/lib/queries/illnesses";
import { IllnessFormDialog } from "@/components/illnesses/illness-form-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  resolved: "Resolved",
  chronic: "Chronic",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  chronic: "secondary",
  resolved: "outline",
};

export default async function IllnessesPage() {
  const ownerId = await requireUserId();
  const illnesses = await listIllnesses(ownerId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Illnesses</h1>
        <IllnessFormDialog />
      </div>

      {illnesses.length === 0 ? (
        <p className="text-muted-foreground">
          No illnesses yet. Create one to start logging consultations, prescriptions,
          and test results under it.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {illnesses.map((illness) => (
            <Link key={illness.id} href={`/illnesses/${illness.id}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{illness.title}</CardTitle>
                    <Badge variant={STATUS_VARIANT[illness.status]}>
                      {STATUS_LABEL[illness.status]}
                    </Badge>
                  </div>
                </CardHeader>
                {(illness.startDate || illness.notes) && (
                  <CardContent className="text-sm text-muted-foreground">
                    {illness.startDate && <p>Since {illness.startDate}</p>}
                    {illness.notes && <p className="line-clamp-2">{illness.notes}</p>}
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
