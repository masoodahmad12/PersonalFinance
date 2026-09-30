import { ArrowDownLeft, ArrowUpRight, PiggyBank, Receipt, Undo2, type LucideIcon } from "lucide-react";
import { formatPKR, formatPercent, percentChange } from "@/lib/format";
import type { Summary } from "@/lib/types";
import { cn } from "@/lib/utils";

type Card = {
  key: keyof Summary;
  label: string;
  icon: LucideIcon;
  tone: string;
  hint?: string;
  /** Whether an increase is good news (green) or bad news (red). */
  upIsGood: boolean;
};

const CARDS: Card[] = [
  { key: "income", label: "Income", icon: ArrowDownLeft, tone: "text-income bg-income/12", upIsGood: true },
  { key: "expense", label: "Total expense", icon: ArrowUpRight, tone: "text-expense bg-expense/12", upIsGood: false },
  { key: "returned", label: "Amount returned", icon: Undo2, tone: "text-returned bg-returned/15", upIsGood: true },
  {
    key: "actualExpense",
    label: "Actual expense",
    icon: Receipt,
    tone: "text-primary bg-primary/12",
    hint: "Total expense - returned",
    upIsGood: false,
  },
  { key: "net", label: "Net savings", icon: PiggyBank, tone: "text-chart-5 bg-chart-5/12", hint: "Income - actual expense", upIsGood: true },
];

export function SummaryCards({ current, previous }: { current: Summary; previous: Summary }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {CARDS.map((card, i) => {
        const value = current[card.key];
        const change = percentChange(value, previous[card.key]);
        const showChange = Number.isFinite(change) && previous[card.key] !== 0;
        const good = card.upIsGood ? change >= 0 : change <= 0;
        const featured = card.key === "actualExpense";

        return (
          <div
            key={card.key}
            className={cn(
              "relative overflow-hidden rounded-2xl border bg-card p-4",
              featured && "border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card",
              i === CARDS.length - 1 && "col-span-2 md:col-span-1",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", card.tone)}>
                <card.icon className="size-4" />
              </span>
            </div>
            <p
              className={cn(
                "mt-2 truncate text-xl font-semibold tracking-tight tabular md:text-2xl",
                card.key === "net" && value < 0 && "text-expense",
              )}
            >
              {formatPKR(value)}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs">
              {showChange ? (
                <span className={cn("font-medium", good ? "text-income" : "text-expense")}>
                  {formatPercent(change)}
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
              <span className="truncate text-muted-foreground">{card.hint ?? "vs last month"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
