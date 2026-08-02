import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { listCases } from "@/lib/queries/cases";
import { CaseFormDialog } from "@/components/cases/case-form-dialog";
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

export default async function CasesPage() {
  const ownerId = await requireUserId();
  const cases = await listCases(ownerId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cases</h1>
        <CaseFormDialog />
      </div>

      {cases.length === 0 ? (
        <p className="text-muted-foreground">
          No cases yet. Create one to start logging consultations, prescriptions,
          and test results under it.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cases.map((caseItem) => (
            <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{caseItem.title}</CardTitle>
                    <Badge variant={STATUS_VARIANT[caseItem.status]}>
                      {STATUS_LABEL[caseItem.status]}
                    </Badge>
                  </div>
                </CardHeader>
                {(caseItem.startDate || caseItem.notes) && (
                  <CardContent className="text-sm text-muted-foreground">
                    {caseItem.startDate && <p>Since {caseItem.startDate}</p>}
                    {caseItem.notes && <p className="line-clamp-2">{caseItem.notes}</p>}
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
