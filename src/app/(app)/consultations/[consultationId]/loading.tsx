import { Skeleton } from "@/components/ui/skeleton";

export default function ConsultationDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-16 w-full rounded-md" />
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}
