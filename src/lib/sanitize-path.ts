/** Makes arbitrary user text safe to use as a folder/file name segment. */
export function sanitizePathSegment(value: string, fallback: string): string {
  const cleaned = value
    .replace(/[\\/:*?"<>|\x00-\x1f]/g, "")
    .trim()
    .slice(0, 80);
  return cleaned.length > 0 ? cleaned : fallback;
}
