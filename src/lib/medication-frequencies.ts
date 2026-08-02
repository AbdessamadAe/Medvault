/**
 * Suggested list for the medication "frequency" field, offered via
 * <datalist> — common enough that most entries are a click, but free
 * text still works for anything unusual.
 */
export const COMMON_FREQUENCIES = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "As needed (PRN)",
  "Before meals",
  "After meals",
  "At bedtime",
  "Once a week",
  "Once",
] as const;
