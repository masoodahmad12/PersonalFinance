"use client";

import { ArrowDownLeft, ArrowUpRight, Undo2 } from "lucide-react";
import { TRANSACTION_TYPES, TYPE_SHORT_LABELS, type TransactionType } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const TYPE_ICONS = { income: ArrowDownLeft, expense: ArrowUpRight, returned: Undo2 };

const ACTIVE_STYLES: Record<TransactionType, string> = {
  income: "bg-income text-white shadow-sm",
  expense: "bg-expense text-white shadow-sm",
  returned: "bg-returned text-white shadow-sm",
};

export function TypeSegmented({
  value,
  onChange,
  disabled,
}: {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
      {TRANSACTION_TYPES.map((type) => {
        const Icon = TYPE_ICONS[type];
        const active = value === type;
        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(type)}
            className={cn(
              "flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground transition-all hover:text-foreground disabled:opacity-60",
              active && ACTIVE_STYLES[type],
              active && "hover:text-white",
            )}
          >
            <Icon className="size-4" />
            {TYPE_SHORT_LABELS[type]}
          </button>
        );
      })}
    </div>
  );
}
