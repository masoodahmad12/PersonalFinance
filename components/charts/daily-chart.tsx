"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatYmd } from "@/lib/dates";
import { formatCompact } from "@/lib/format";
import { ChartTooltip } from "./chart-tooltip";

type Point = { date: string; expense: number; returned: number };

export function DailyChart({ data }: { data: Point[] }) {
  const series = data.map((d) => ({ date: d.date, spent: Math.max(0, d.expense - d.returned) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={series} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="dailyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => formatYmd(d, "d")}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          interval="preserveStartEnd"
          minTickGap={16}
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
        <Tooltip content={<ChartTooltip labelFormatter={(d) => formatYmd(d, "EEE, d MMM")} />} />
        <Area
          type="monotone"
          dataKey="spent"
          name="Actual expense"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#dailyFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
