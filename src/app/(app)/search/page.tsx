import Link from "next/link";
import { Suspense } from "react";
import { requireUserId } from "@/lib/auth";
import { searchRecords } from "@/lib/queries/search";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchIcon } from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  case: "Case",
  doctor: "Doctor",
  consultation: "Consultation",
  "test-result": "Test Result",
};

// Only the results depend on the database — the heading and search box
// need nothing but the URL, so SearchPage below renders them immediately.
async function SearchResults({ term }: { term: string }) {
  const ownerId = await requireUserId();
  const results = term.length > 0 ? await searchRecords(ownerId, term) : [];

  if (term.length > 0 && results.length === 0) {
    return <p className="text-muted-foreground">No matches for &quot;{term}&quot;.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {results.map((result) => (
        <Link
          key={`${result.type}-${result.id}`}
          href={result.href}
          className="flex items-center gap-3 rounded-md border px-3 py-2 hover:border-primary"
        >
          <Badge variant="secondary">{TYPE_LABEL[result.type]}</Badge>
          <span>{result.title}</span>
        </Link>
      ))}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = q?.trim() ?? "";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Search</h1>
      <form className="flex gap-2">
        <Input
          type="search"
          name="q"
          placeholder="Search titles, notes, test names…"
          defaultValue={term}
          autoFocus
        />
        <Button type="submit">
          <SearchIcon className="size-4" />
          Search
        </Button>
      </form>

      <Suspense
        key={term}
        fallback={
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        }
      >
        <SearchResults term={term} />
      </Suspense>
    </div>
  );
}
