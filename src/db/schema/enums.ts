import { pgEnum } from "drizzle-orm/pg-core";

export const caseStatusEnum = pgEnum("case_status", [
  "active",
  "resolved",
  "chronic",
]);

export const testResultTypeEnum = pgEnum("test_result_type", [
  "lab",
  "imaging",
]);
