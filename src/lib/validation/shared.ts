import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Matches the value format of an HTML <input type="date">. */
export const dateString = z
  .string()
  .regex(DATE_REGEX, "Enter a valid date (YYYY-MM-DD)");

export const optionalDateString = z
  .string()
  .regex(DATE_REGEX, "Enter a valid date (YYYY-MM-DD)")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

export function requiredText(maxLength: number) {
  return z
    .string()
    .trim()
    .min(1, "This field is required")
    .max(maxLength, `Must be ${maxLength} characters or fewer`);
}

export function optionalText(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength, `Must be ${maxLength} characters or fewer`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));
}

export const uuid = z.uuid("Invalid identifier");

export function optionalUrl(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength, `Must be ${maxLength} characters or fewer`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined))
    .refine((value) => value === undefined || /^https?:\/\//i.test(value), {
      message: "Enter a valid URL starting with http:// or https://",
    });
}
