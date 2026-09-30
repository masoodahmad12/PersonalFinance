"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCompact, formatPKR } from "@/lib/format";
import type { CategoryTotal } from "@/lib/types";
import { ChartTooltip } from "./chart-tooltip";

export function CategoryDonut({ data, maxSlices = 6 }: { data: CategoryTotal[]; maxSlices?: number }) {
  const total = data.reduce((s, d) => s + d.total, 0);
  const slices =
    data.length > maxSlices
      ? [
          ...data.slice(0, maxSlices - 1),
          {
            id: "others",
            name: "Others",
            color: "#94a3b8",
            icon: "circle-ellipsis",
            total: data.slice(maxSlices - 1).reduce((s, d) => s + d.total, 0),
            count: 0,
          },
        ]
      : data;

  return (
    <div className="@container">
      <div className="flex flex-col items-center gap-5 @md:flex-row">
        <div className="relative size-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="total"
                nameKey="name"
                innerRadius="68%"
                outerRadius="100%"
                paddingAngle={2}
                cornerRadius={4}
                stroke="none"
                isAnimationActive={false}
              >
                {slices.map((s) => (
                  <Cell key={s.id} fill={s.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-lg font-semibold tabular">{formatCompact(total)}</span>
          </div>
        </div>
        <ul className="w-full min-w-0 flex-1 space-y-2">
          {slices.map((s) => (
            <li key={s.id} className="flex items-center gap-2 text-sm">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="min-w-0 flex-1 truncate">{s.name}</span>
              <span className="text-xs text-muted-foreground tabular">
                {total ? Math.round((s.total / total) * 100) : 0}%
              </span>
              <span className="shrink-0 text-right font-medium tabular">{formatPKR(s.total)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
