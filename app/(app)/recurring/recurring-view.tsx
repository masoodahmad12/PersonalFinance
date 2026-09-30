"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, MoreVertical, Pause, Pencil, Play, Plus, Repeat, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteRecurring, setRecurringActive } from "@/actions/recurring";
import { CategoryIcon } from "@/components/category-icon";
import { ConfirmDialog } from "@/components/confirm-button";
import { EmptyState } from "@/components/empty-state";
import { RecurringForm } from "@/components/forms/recurring-form";
import { PageHeader } from "@/components/page-header";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TYPE_SHORT_LABELS, type TransactionType } from "@/lib/constants";
import { formatYmd } from "@/lib/dates";
import { formatPKR } from "@/lib/format";
import { describeSchedule } from "@/lib/recurring-format";
import type { RecurringDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_BADGE: Record<TransactionType, string> = {
  income: "bg-income/12 text-income",
  expense: "bg-expense/12 text-expense",
  returned: "bg-returned/15 text-returned",
};

export function RecurringView({ rules }: { rules: RecurringDTO[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<{ open: boolean; rule: RecurringDTO | null; key: number }>({
    open: false,
    rule: null,
    key: 0,
  });
  const [toDelete, setToDelete] = useState<RecurringDTO | null>(null);

  const openDialog = (rule: RecurringDTO | null) =>
    setDialog((d) => ({ open: true, rule, key: d.key + 1 }));

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) return void toast.error(res.error);
      toast.success(success);
      router.refresh();
    });

  const active = rules.filter((r) => r.isActive);
  const monthlyEstimate = (type: TransactionType) =>
    active
      .filter((r) => r.type === type)
      .reduce((sum, r) => {
        const perMonth = { daily: 30.44, weekly: 4.35, monthly: 1, yearly: 1 / 12 }[r.frequency];
        return sum + (r.amount * perMonth) / r.interval;
      }, 0);

  return (
    <>
      <PageHeader
        title="Recurring"
        description="Transactions that are added automatically on a schedule."
        actions={
          <Button onClick={() => openDialog(null)}>
            <Plus /> New recurring
          </Button>
        }
      />

      {active.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-2 sm:max-w-md">
          <div className="rounded-xl border bg-card px-3 py-2">
            <p className="text-xs text-muted-foreground">Monthly recurring income</p>
            <p className="text-sm font-semibold text-income tabular">
              {formatPKR(monthlyEstimate("income"))}
            </p>
          </div>
          <div className="rounded-xl border bg-card px-3 py-2">
            <p className="text-xs text-muted-foreground">Monthly recurring expense</p>
            <p className="text-sm font-semibold text-expense tabular">
              {formatPKR(monthlyEstimate("expense"))}
            </p>
          </div>
        </div>
      )}

      {rules.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No recurring transactions"
          description="Set up rent, salary, subscriptions or bills once and they'll be added for you."
          action={
            <Button variant="outline" onClick={() => openDialog(null)}>
              <Plus /> Create one
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {rules.map((r) => {
            const category = r.category ?? { name: "Deleted category", color: "#64748b", icon: "circle-help" };
            return (
              <div
                key={r.id}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md",
                  !r.isActive && "opacity-60",
                )}
              >
                <CategoryIcon icon={category.icon} color={category.color} />
                <button className="min-w-0 flex-1 text-left" onClick={() => openDialog(r)}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{r.note || category.name}</p>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", TYPE_BADGE[r.type])}>
                      {TYPE_SHORT_LABELS[r.type]}
                    </span>
                    {!r.isActive && <Badge variant="secondary">Paused</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.note ? `${category.name} · ` : ""}
                    {describeSchedule(r.frequency, r.interval)}
                    {r.endDate ? ` until ${formatYmd(r.endDate)}` : ""}
                  </p>
                  {r.isActive && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarClock className="size-3.5" />
                      Next: {formatYmd(r.nextRunDate, "EEE, d MMM yyyy")}
                    </p>
                  )}
                </button>
                <div className="flex flex-col items-end gap-1">
                  <p className="font-semibold tabular">{formatPKR(r.amount, true)}</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Actions" disabled={pending}>
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog(r)}>
                        <Pencil /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          run(
                            () => setRecurringActive(r.id, !r.isActive),
                            r.isActive ? "Paused" : "Resumed",
                          )
                        }
                      >
                        {r.isActive ? <Pause /> : <Play />}
                        {r.isActive ? "Pause" : "Resume"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => setToDelete(r)}>
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete this recurring item?"
        description="Transactions it already created will be kept."
        onConfirm={() => {
          if (toDelete) run(() => deleteRecurring(toDelete.id), "Recurring item deleted");
          setToDelete(null);
        }}
      />

      <ResponsiveDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        title={dialog.rule ? "Edit recurring item" : "New recurring item"}
      >
        <RecurringForm
          key={dialog.key}
          rule={dialog.rule}
          onDone={() => {
            setDialog((d) => ({ ...d, open: false }));
            router.refresh();
          }}
        />
      </ResponsiveDialog>
    </>
  );
}
