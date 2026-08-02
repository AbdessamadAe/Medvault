/**
 * Fixed, small taxonomy of body systems used to tag Cases (e.g. "which
 * cases touch the digestive system"). Deliberately coarse — general
 * knowledge of body areas, not specific anatomy — and deliberately fixed
 * (not user-creatable) so tagging stays a quick tap, not a research task.
 *
 * Single source of truth: src/db/schema/enums.ts builds the Postgres enum
 * from BODY_SYSTEM_VALUES, so this list only needs to change in one place.
 */
export const BODY_SYSTEM_VALUES = [
  "digestive",
  "respiratory",
  "ent",
  "cardiovascular",
  "musculoskeletal",
  "nervous",
  "skin",
  "eyes",
  "dental",
  "urinary",
  "reproductive",
  "endocrine",
  "immune",
  "mental_health",
  "general",
] as const;

export type BodySystem = (typeof BODY_SYSTEM_VALUES)[number];

export const BODY_SYSTEM_LABELS: Record<BodySystem, string> = {
  digestive: "Digestive",
  respiratory: "Respiratory",
  ent: "Ears, Nose & Throat",
  cardiovascular: "Cardiovascular",
  musculoskeletal: "Musculoskeletal",
  nervous: "Nervous System",
  skin: "Skin",
  eyes: "Eyes",
  dental: "Dental / Oral",
  urinary: "Urinary",
  reproductive: "Reproductive",
  endocrine: "Endocrine",
  immune: "Immune / Blood",
  mental_health: "Mental Health",
  general: "General / Other",
};
