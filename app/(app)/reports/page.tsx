import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { currentMonthKey, isValidMonthKey, monthLabel, monthRange, shiftMonthKey } from "@/lib/dates";
import { formatPKR, formatPercent, percentChange } from "@/lib/format";
import { getCategoryTotals, getCategoryTrend, getMonthSummary, getMonthlyTrend, getSummary } from "@/lib/stats";
import type { CategoryTotal, Summary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/category-icon";
import { CategoryTrendChart } from "@/components/charts/category-trend-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { EmptyState } from "@/components/empty-state";
import { MonthPicker } from "@/components/month-picker";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { REPORT_RANGES as RANGES } from "@/lib/constants";
import { RangePicker } from "./range-picker";

export const metadata: Metadata = { title: "Reports" };

const METRICS: { key: keyof Summary; label: string; upIsGood: boolean }[] = [
  { key: "income", label: "Income", upIsGood: true },
  { key: "expense", label: "Total expense", upIsGood: false },
  { key: "returned", label: "Amount returned", upIsGood: true },
  { key: "actualExpense", label: "Actual expense", upIsGood: false },
  { key: "net", label: "Net savings", upIsGood: true },
];

function Change({ current, previous, upIsGood }: { current: number; previous: number; upIsGood: boolean }) {
  const change = percentChange(current, previous);
  if (!Number.isFinite(change) || previous === 0) {
    return <span className="text-muted-foreground">{current === 0 ? "-" : "New"}</span>;
  }
  const good = upIsGood ? change >= 0 : change <= 0;
  return (
    <span className={cn("font-medium", change === 0 ? "text-muted-foreground" : good ? "text-income" : "text-expense")}>
      {formatPercent(change)}
    </span>
  );
}

function TopList({ items, emptyLabel }: { items: CategoryTotal[]; emptyLabel: string }) {
  const total = items.reduce((s, i) => s + i.total, 0);
  if (!items.length) return <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  return (
    <ul className="space-y-3.5">
      {items.slice(0, 8).map((c) => {
        const pct = total ? (c.total / total) * 100 : 0;
        return (
          <li key={c.id} className="flex items-center gap-3">
            <CategoryIcon icon={c.icon} color={c.color} size="sm" className="size-9" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium">{c.name}</span>
                <span className="font-semibold tabular">{formatPKR(c.total)}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                </div>
                <span className="w-10 text-right text-xs text-muted-foreground tabular">{pct.toFixed(0)}%</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; range?: string }>;
}) {
  const sp = await searchParams;
  const month = isValidMonthKey(sp.month) ? sp.month : currentMonthKey();
  const range = (RANGES as readonly number[]).includes(Number(sp.range)) ? Number(sp.range) : 6;
  const prevMonth = shiftMonthKey(month, -1);

  const cur = monthRange(month);
  const prev = monthRange(prevMonth);
  const rangeStart = monthRange(shiftMonthKey(month, -(range - 1))).start;

  const [current, previous, curCats, prevCats, trend, catTrend, topExpense, topIncome, topReturned, rangeSummary] =
    await Promise.all([
      getMonthSummary(month),
      getMonthSummary(prevMonth),
      getCategoryTotals("expense", cur.start, cur.end),
      getCategoryTotals("expense", prev.start, prev.end),
      getMonthlyTrend(month, range),
      getCategoryTrend("expense", month, range),
      getCategoryTotals("expense", rangeStart, cur.end),
      getCategoryTotals("income", rangeStart, cur.end),
      getCategoryTotals("returned", rangeStart, cur.end),
      getSummary(rangeStart, cur.end),
    ]);

  const prevById = new Map(prevCats.map((c) => [c.id, c]));
  const comparisonRows = [
    ...curCats.map((c) => ({ ...c, previous: prevById.get(c.id)?.total ?? 0 })),
    ...prevCats.filter((c) => !curCats.some((x) => x.id === c.id)).map((c) => ({ ...c, total: 0, previous: c.total })),
  ];

  const savingsRate = rangeSummary.income ? (rangeSummary.net / rangeSummary.income) * 100 : 0;
  const hasData = rangeSummary.count > 0 || current.count > 0 || previous.count > 0;

  return (
    <>
      <PageHeader
        title="Reports"
        description="Compare months and spot spending trends."
        actions={
          <>
            <MonthPicker month={month} />
            <RangePicker range={range} />
          </>
        }
      />

      {!hasData ? (
        <EmptyState icon={BarChart3} title="Nothing to report yet" description="Add some transactions to see reports." />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {monthLabel(month, "MMMM")} vs {monthLabel(prevMonth, "MMMM")}
                </CardTitle>
                <CardDescription>Month-over-month comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="pb-2 font-medium">Metric</th>
                        <th className="pb-2 pl-3 text-right font-medium">{monthLabel(month, "MMM")}</th>
                        <th className="pb-2 pl-3 text-right font-medium">{monthLabel(prevMonth, "MMM")}</th>
                        <th className="pb-2 pl-3 text-right font-medium">Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {METRICS.map((m) => (
                        <tr key={m.key} className={m.key === "actualExpense" ? "font-semibold" : undefined}>
                          <td className="py-2.5">{m.label}</td>
                          <td className="py-2.5 pl-3 text-right whitespace-nowrap tabular">{formatPKR(current[m.key])}</td>
                          <td className="py-2.5 pl-3 text-right whitespace-nowrap text-muted-foreground tabular">
                            {formatPKR(previous[m.key])}
                          </td>
                          <td className="py-2.5 pl-3 text-right whitespace-nowrap text-xs tabular">
                            <Change current={current[m.key]} previous={previous[m.key]} upIsGood={m.upIsGood} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense categories</CardTitle>
                <CardDescription>
                  {monthLabel(month, "MMM")} vs {monthLabel(prevMonth, "MMM")}, by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {comparisonRows.length ? (
                  <div className="max-h-80 overflow-auto">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-border/60">
                        {comparisonRows.map((c) => (
                          <tr key={c.id}>
                            <td className="py-2">
                              <span className="flex items-center gap-2">
                                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                                <span className="truncate">{c.name}</span>
                              </span>
                            </td>
                            <td className="py-2 pl-3 text-right whitespace-nowrap tabular">{formatPKR(c.total)}</td>
                            <td className="hidden py-2 pl-3 text-right whitespace-nowrap text-muted-foreground tabular sm:table-cell">
                              {formatPKR(c.previous)}
                            </td>
                            <td className="py-2 pl-3 text-right whitespace-nowrap text-xs tabular">
                              <Change current={c.total} previous={c.previous} upIsGood={false} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">No expenses in either month.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: `Income (${range}M)`, value: formatPKR(rangeSummary.income), cls: "text-income" },
              { label: `Actual expense (${range}M)`, value: formatPKR(rangeSummary.actualExpense), cls: "text-expense" },
              { label: `Net savings (${range}M)`, value: formatPKR(rangeSummary.net), cls: rangeSummary.net < 0 ? "text-expense" : "" },
              { label: "Savings rate", value: rangeSummary.income ? `${savingsRate.toFixed(1)}%` : "-", cls: "text-primary" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border bg-card p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={cn("mt-1 truncate text-lg font-semibold tabular", s.cls)}>{s.value}</p>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Income vs actual expense</CardTitle>
              <CardDescription>Last {range} months</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart data={trend} height={280} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category trends</CardTitle>
              <CardDescription>Top expense categories per month, last {range} months</CardDescription>
            </CardHeader>
            <CardContent>
              {catTrend.categories.length ? (
                <CategoryTrendChart rows={catTrend.rows} categories={catTrend.categories} />
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">No expenses in this period.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Top expenses</CardTitle>
                <CardDescription>Last {range} months</CardDescription>
              </CardHeader>
              <CardContent>
                <TopList items={topExpense} emptyLabel="No expenses in this period." />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Income sources</CardTitle>
                <CardDescription>Last {range} months</CardDescription>
              </CardHeader>
              <CardContent>
                <TopList items={topIncome} emptyLabel="No income in this period." />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Amounts returned</CardTitle>
                <CardDescription>Last {range} months</CardDescription>
              </CardHeader>
              <CardContent>
                <TopList items={topReturned} emptyLabel="Nothing returned in this period." />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
