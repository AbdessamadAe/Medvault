import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { listCases } from "@/lib/queries/cases";
import { CaseFormDialog } from "@/components/cases/case-form-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BODY_SYSTEM_LABELS, BODY_SYSTEM_VALUES, type BodySystem } from "@/lib/body-systems";

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

function isBodySystem(value: string): value is BodySystem {
  return (BODY_SYSTEM_VALUES as readonly string[]).includes(value);
}

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ system?: string }>;
}) {
  const { system } = await searchParams;
  const activeFilter = system && isBodySystem(system) ? system : undefined;
  const ownerId = await requireUserId();
  const cases = await listCases(ownerId, activeFilter);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cases</h1>
        <CaseFormDialog />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/cases"
          className={cn(
            "rounded-full border px-3 py-1 text-sm transition-colors hover:bg-accent",
            !activeFilter && "border-primary bg-primary text-primary-foreground",
          )}
        >
          All
        </Link>
        {BODY_SYSTEM_VALUES.map((value) => (
          <Link
            key={value}
            href={`/cases?system=${value}`}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors hover:bg-accent",
              activeFilter === value && "border-primary bg-primary text-primary-foreground",
            )}
          >
            {BODY_SYSTEM_LABELS[value]}
          </Link>
        ))}
      </div>

      {cases.length === 0 ? (
        <p className="text-muted-foreground">
          {activeFilter
            ? `No cases tagged "${BODY_SYSTEM_LABELS[activeFilter]}".`
            : "No cases yet. Create one to start logging consultations, prescriptions, and test results under it."}
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
                <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {caseItem.startDate && <p>Since {caseItem.startDate}</p>}
                  {caseItem.notes && <p className="line-clamp-2">{caseItem.notes}</p>}
                  {caseItem.bodySystems.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {caseItem.bodySystems.map((value) => (
                        <Badge key={value} variant="outline">
                          {BODY_SYSTEM_LABELS[value]}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
