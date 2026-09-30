"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center">
      <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </span>
      <p className="font-medium">Something went wrong</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {error.message?.includes("MONGODB_URI")
          ? error.message
          : "We couldn't load this page. Check your connection and try again."}
      </p>
      <Button className="mt-4" variant="outline" onClick={reset}>
        <RotateCcw /> Try again
      </Button>
    </div>
  );
}
