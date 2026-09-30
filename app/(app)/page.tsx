import Link from "next/link";
import { ArrowRight, CalendarClock, PieChart, Receipt } from "lucide-react";
import { getRecentTransactions, getRecurring } from "@/lib/data";
import { currentMonthKey, formatYmd, isValidMonthKey, monthLabel, monthRange, shiftMonthKey } from "@/lib/dates";
import { formatPKR } from "@/lib/format";
import { processDueRecurring } from "@/lib/recurring";
import { describeSchedule } from "@/lib/recurring-format";
import { getCategoryTotals, getDailySeries, getMonthSummary, getMonthlyTrend } from "@/lib/stats";
import { CategoryIcon } from "@/components/category-icon";
import { CategoryDonut } from "@/components/charts/category-donut";
import { DailyChart } from "@/components/charts/daily-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { EmptyState } from "@/components/empty-state";
import { MonthPicker } from "@/components/month-picker";
import { PageHeader } from "@/components/page-header";
import { TransactionRow } from "@/components/transactions/transaction-list";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const month = isValidMonthKey(monthParam) ? monthParam : currentMonthKey();
  const { start, end } = monthRange(month);

  await processDueRecurring().catch((e) => console.error("Recurring processing failed", e));

  const [summary, previous, byCategory, trend, daily, recent, upcoming] = await Promise.all([
    getMonthSummary(month),
    getMonthSummary(shiftMonthKey(month, -1)),
    getCategoryTotals("expense", start, end),
    getMonthlyTrend(month, 6),
    getDailySeries(month),
    getRecentTransactions(6),
    getRecurring({ activeOnly: true, limit: 5 }),
  ]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Overview for ${monthLabel(month)}`}
        actions={
          <>
            <MonthPicker month={month} />
            <AddTransactionButton className="hidden md:inline-flex" />
          </>
        }
      />

      <SummaryCards current={summary} previous={previous} />

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Income vs actual expense</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart data={trend} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Spending by category</CardTitle>
            <CardDescription>Expenses in {monthLabel(month, "MMMM")}</CardDescription>
          </CardHeader>
          <CardContent>
            {byCategory.length ? (
              <CategoryDonut data={byCategory} />
            ) : (
              <EmptyState icon={PieChart} title="No expenses this month" className="py-8" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Daily spending</CardTitle>
          <CardDescription>Actual expense per day in {monthLabel(month, "MMMM")}</CardDescription>
        </CardHeader>
        <CardContent>
          <DailyChart data={daily} />
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/transactions">
                  View all <ArrowRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {recent.length ? (
              <div className="-mx-2 divide-y divide-border/60">
                {recent.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} showDate />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Receipt}
                title="No transactions yet"
                description="Add your first income or expense to get started."
                action={<AddTransactionButton />}
                className="py-8"
              />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming recurring</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/recurring">
                  Manage <ArrowRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {upcoming.length ? (
              <ul className="space-y-3">
                {upcoming.map((r) => {
                  const cat = r.category ?? { name: "Deleted category", color: "#64748b", icon: "circle-help" };
                  return (
                    <li key={r.id} className="flex items-center gap-3">
                      <CategoryIcon icon={cat.icon} color={cat.color} size="sm" className="size-9" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{r.note || cat.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatYmd(r.nextRunDate, "d MMM")} · {describeSchedule(r.frequency, r.interval)}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold tabular ${r.type === "expense" ? "" : r.type === "income" ? "text-income" : "text-returned"}`}
                      >
                        {formatPKR(r.amount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={CalendarClock}
                title="Nothing scheduled"
                description="Automate rent, salary or subscriptions."
                className="py-8"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
