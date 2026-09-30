"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currentMonthKey, monthLabel, shiftMonthKey } from "@/lib/dates";

export function MonthPicker({ month }: { month: string }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const isCurrent = month === currentMonthKey();

  const href = (m: string) => {
    const next = new URLSearchParams(params.toString());
    if (m === currentMonthKey()) next.delete("month");
    else next.set("month", m);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <div className="flex items-center gap-1 rounded-xl border bg-card p-1">
      <Button variant="ghost" size="icon-sm" asChild aria-label="Previous month">
        <Link href={href(shiftMonthKey(month, -1))} scroll={false}>
          <ChevronLeft />
        </Link>
      </Button>
      <span className="min-w-32 text-center text-sm font-medium">{monthLabel(month)}</span>
      <Button variant="ghost" size="icon-sm" asChild aria-label="Next month">
        <Link href={href(shiftMonthKey(month, 1))} scroll={false}>
          <ChevronRight />
        </Link>
      </Button>
      {!isCurrent && (
        <Button variant="ghost" size="sm" asChild>
          <Link href={href(currentMonthKey())} scroll={false}>
            Today
          </Link>
        </Button>
      )}
    </div>
  );
}
