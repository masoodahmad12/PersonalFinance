"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REPORT_RANGES as RANGES } from "@/lib/constants";

export function RangePicker({ range }: { range: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <Tabs
      value={String(range)}
      onValueChange={(v) => {
        const next = new URLSearchParams(params.toString());
        if (v === "6") next.delete("range");
        else next.set("range", v);
        const qs = next.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      }}
    >
      <TabsList>
        {RANGES.map((r) => (
          <TabsTrigger key={r} value={String(r)} className="px-3">
            {r}M
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
