import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Receipt } from "lucide-react";
import { getTransactions } from "@/lib/data";
import { formatPKR } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { GroupedTransactionList } from "@/components/transactions/transaction-list";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";
import { Button } from "@/components/ui/button";
import { TransactionFilters } from "./transaction-filters";

export const metadata: Metadata = { title: "Transactions" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function str(v: string | string[] | undefined) {
  return typeof v === "string" ? v : undefined;
}

export default async function TransactionsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filters = {
    q: str(sp.q),
    type: str(sp.type),
    category: str(sp.category),
    from: str(sp.from),
    to: str(sp.to),
    page: Number(str(sp.page)) || 1,
  };
  const { items, total, page, pageCount, totals } = await getTransactions(filters);
  const filtered = !!(filters.q || filters.type || filters.category || filters.from || filters.to);
  const actual = totals.expense - totals.returned;

  const pageHref = (p: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) if (v && k !== "page") next.set(k, String(v));
    if (p > 1) next.set("page", String(p));
    const qs = next.toString();
    return qs ? `/transactions?${qs}` : "/transactions";
  };

  return (
    <>
      <PageHeader
        title="Transactions"
        description={`${total} transaction${total === 1 ? "" : "s"}${filtered ? " match your filters" : ""}`}
        actions={<AddTransactionButton className="hidden md:inline-flex" />}
      />

      <TransactionFilters />

      {total > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Income", value: totals.income, className: "text-income" },
            { label: "Expense", value: totals.expense, className: "text-expense" },
            { label: "Returned", value: totals.returned, className: "text-returned" },
            { label: "Actual expense", value: actual, className: "" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card px-3 py-2">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-sm font-semibold tabular ${s.className}`}>{formatPKR(s.value)}</p>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={filtered ? "No matching transactions" : "No transactions yet"}
          description={
            filtered ? "Try changing or clearing the filters." : "Add your first income or expense."
          }
          action={!filtered && <AddTransactionButton />}
        />
      ) : (
        <GroupedTransactionList items={items} />
      )}

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" asChild={page > 1} disabled={page <= 1}>
            {page > 1 ? (
              <Link href={pageHref(page - 1)}>
                <ChevronLeft /> Previous
              </Link>
            ) : (
              <span>
                <ChevronLeft /> Previous
              </span>
            )}
          </Button>
          <span className="text-sm text-muted-foreground tabular">
            Page {page} of {pageCount}
          </span>
          <Button variant="outline" asChild={page < pageCount} disabled={page >= pageCount}>
            {page < pageCount ? (
              <Link href={pageHref(page + 1)}>
                Next <ChevronRight />
              </Link>
            ) : (
              <span>
                Next <ChevronRight />
              </span>
            )}
          </Button>
        </div>
      )}
    </>
  );
}
