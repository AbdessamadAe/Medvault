"use client";

import { useActionState, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/submit-button";
import { DatalistInput } from "@/components/datalist-input";
import { createTestResult, updateTestResult } from "@/lib/actions/test-results";
import { PlusIcon } from "lucide-react";
import type { testResults } from "@/db/schema";

const initialState = { success: false as const, error: "" };

export function TestResultFormDialog({
  consultationId,
  testNameSuggestions = [],
  testResult,
}: {
  consultationId: string;
  testNameSuggestions?: string[];
  testResult?: typeof testResults.$inferSelect;
}) {
  const [open, setOpen] = useState(false);
  const action = testResult
    ? updateTestResult.bind(null, testResult.id)
    : createTestResult;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={testResult ? "outline" : "default"} size="sm" />}>
        {!testResult && <PlusIcon className="size-4" />}
        {testResult ? "Edit" : "Add test result"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{testResult ? "Edit test result" : "Add test result"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="consultationId" value={consultationId} />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" defaultValue={testResult?.date} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue={testResult?.type ?? "lab"}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab">Lab</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="testName">Test name</Label>
            <DatalistInput
              id="testName"
              name="testName"
              placeholder="e.g. Complete Blood Count, Chest X-Ray"
              defaultValue={testResult?.testName}
              options={testNameSuggestions}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="resultNotes">Result notes</Label>
            <Textarea
              id="resultNotes"
              name="resultNotes"
              defaultValue={testResult?.resultNotes ?? undefined}
              rows={4}
            />
          </div>
          {!state.success && state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <SubmitButton className="w-full">
            {testResult ? "Save changes" : "Add test result"}
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
