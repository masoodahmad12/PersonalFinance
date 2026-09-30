import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="space-y-2 rounded-2xl border p-3">
          <Skeleton className="h-4 w-36" />
          {Array.from({ length: 3 }, (_, j) => (
            <div key={j} className="flex items-center gap-3 py-1.5">
              <Skeleton className="size-10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
