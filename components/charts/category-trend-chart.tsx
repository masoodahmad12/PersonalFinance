"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthLabel } from "@/lib/dates";
import { formatCompact } from "@/lib/format";
import { ChartTooltip } from "./chart-tooltip";

export function CategoryTrendChart({
  rows,
  categories,
}: {
  rows: Record<string, number | string>[];
  categories: { id: string; name: string; color: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={rows} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="month"
          tickFormatter={(m: string) => monthLabel(m, "MMM")}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="var(--muted-foreground)"
        />
        <YAxis
          tickFormatter={(v: number) => formatCompact(v)}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          width={48}
          stroke="var(--muted-foreground)"
        />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          content={<ChartTooltip labelFormatter={(m) => monthLabel(m)} />}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(v) => <span className="text-muted-foreground">{v}</span>}
        />
        {categories.map((c, i) => (
          <Bar
            key={c.id}
            dataKey={c.id}
            name={c.name}
            stackId="a"
            fill={c.color}
            maxBarSize={40}
            radius={i === categories.length - 1 ? [6, 6, 0, 0] : 0}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
