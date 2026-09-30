"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthLabel } from "@/lib/dates";
import { formatCompact } from "@/lib/format";
import { ChartTooltip } from "./chart-tooltip";

type Point = { month: string; income: number; actualExpense: number; returned?: number };

export function TrendChart({ data, height = 260 }: { data: Point[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barGap={4} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
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
        <Bar dataKey="income" name="Income" fill="var(--income)" radius={[6, 6, 0, 0]} maxBarSize={28} />
        <Bar
          dataKey="actualExpense"
          name="Actual expense"
          fill="var(--expense)"
          radius={[6, 6, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
