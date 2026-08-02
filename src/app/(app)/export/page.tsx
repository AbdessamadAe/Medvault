import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DownloadIcon } from "lucide-react";

export default function ExportPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Export your data</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-lg">Download everything</CardTitle>
          <CardDescription>
            A zip file with every case, doctor, consultation, prescription, and test
            result as structured JSON, plus every original attached file organized by
            case and consultation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/api/export" download className={buttonVariants({ variant: "default" })}>
            <DownloadIcon className="size-4" />
            Download export (.zip)
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
