import { pgEnum } from "drizzle-orm/pg-core";
import { BODY_SYSTEM_VALUES } from "@/lib/body-systems";

export const caseStatusEnum = pgEnum("case_status", [
  "active",
  "resolved",
  "chronic",
]);

export const testResultTypeEnum = pgEnum("test_result_type", [
  "lab",
  "imaging",
]);

export const bodySystemEnum = pgEnum("body_system", BODY_SYSTEM_VALUES);
