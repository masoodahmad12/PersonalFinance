"use client";

import { formatPKR } from "@/lib/format";

type Entry = { name?: string | number; value?: number | string; color?: string; dataKey?: string | number };

export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
}: {
  active?: boolean;
  payload?: Entry[];
  label?: string | number;
  labelFormatter?: (label: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-36 rounded-xl border bg-popover px-3 py-2 text-xs shadow-lg">
      {label !== undefined && (
        <p className="mb-1.5 font-medium">{labelFormatter ? labelFormatter(String(label)) : label}</p>
      )}
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={String(p.dataKey ?? p.name)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}
            </span>
            <span className="font-medium tabular">{formatPKR(Number(p.value ?? 0))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
