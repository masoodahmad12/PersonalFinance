"use client";

import { Repeat } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { formatYmd, shiftYmd, todayYmd } from "@/lib/dates";
import { formatPKR } from "@/lib/format";
import type { TransactionType } from "@/lib/constants";
import type { TransactionDTO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTransactionDialog } from "./transaction-dialog-provider";

const AMOUNT_STYLES: Record<TransactionType, string> = {
  income: "text-income",
  expense: "text-foreground",
  returned: "text-returned",
};

const SIGNS: Record<TransactionType, string> = { income: "+", expense: "-", returned: "+" };

export function TransactionRow({ tx, showDate }: { tx: TransactionDTO; showDate?: boolean }) {
  const { openEdit } = useTransactionDialog();
  const category = tx.category ?? { name: "Deleted category", color: "#64748b", icon: "circle-help" };

  return (
    <button
      onClick={() => openEdit(tx)}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-muted/60"
    >
      <CategoryIcon icon={category.icon} color={category.color} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-medium">
          {category.name}
          {tx.isRecurring && <Repeat className="size-3 shrink-0 text-muted-foreground" />}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {[showDate && formatYmd(tx.date, "d MMM"), tx.type === "returned" && "Returned", tx.note]
            .filter(Boolean)
            .join(" · ") || (tx.type === "income" ? "Income" : "Expense")}
        </p>
      </div>
      <span className={cn("shrink-0 text-sm font-semibold tabular", AMOUNT_STYLES[tx.type])}>
        {SIGNS[tx.type]}
        {formatPKR(tx.amount, true)}
      </span>
    </button>
  );
}

function dayLabel(ymd: string) {
  const today = todayYmd();
  if (ymd === today) return "Today";
  if (ymd === shiftYmd(today, -1)) return "Yesterday";
  return formatYmd(ymd, "EEEE, d MMM yyyy");
}

export function GroupedTransactionList({ items }: { items: TransactionDTO[] }) {
  const groups = new Map<string, TransactionDTO[]>();
  for (const tx of items) {
    const list = groups.get(tx.date) ?? [];
    list.push(tx);
    groups.set(tx.date, list);
  }

  return (
    <div className="space-y-4">
      {[...groups.entries()].map(([date, txs]) => {
        const net = txs.reduce((s, t) => s + (t.type === "expense" ? -t.amount : t.amount), 0);
        return (
          <section key={date} className="rounded-2xl border bg-card p-2">
            <header className="flex items-center justify-between px-2 pt-1 pb-1.5 text-xs font-medium text-muted-foreground">
              <span>{dayLabel(date)}</span>
              <span className="tabular">
                {net >= 0 ? "+" : "-"}
                {formatPKR(Math.abs(net))}
              </span>
            </header>
            <div className="divide-y divide-border/60">
              {txs.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
