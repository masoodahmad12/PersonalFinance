"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { useCategories } from "@/components/providers/categories-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRANSACTION_TYPES, TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ALL = "all";

export function TransactionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const categories = useCategories();
  const [pending, startTransition] = useTransition();

  const [q, setQ] = useState(params.get("q") ?? "");
  const type = params.get("type") ?? ALL;
  const category = params.get("category") ?? ALL;
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const advancedCount = [type !== ALL, category !== ALL, !!from, !!to].filter(Boolean).length;
  const [showAdvanced, setShowAdvanced] = useState(advancedCount > 0);

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (!value || value === ALL) next.delete(key);
      else next.set(key, value);
    }
    next.delete("page");
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  useEffect(() => {
    const current = params.get("q") ?? "";
    if (q === current) return;
    const t = setTimeout(() => update({ q: q.trim() || null }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const categoryOptions = categories.filter((c) => type === ALL || c.type === type);
  const hasAny = advancedCount > 0 || !!params.get("q");

  return (
    <div className="mb-5 space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search notes, categories or amounts"
            className="h-10 pl-9"
          />
          {pending && (
            <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button
          variant="outline"
          className={cn("h-10", advancedCount > 0 && "border-primary text-primary")}
          onClick={() => setShowAdvanced((s) => !s)}
        >
          <SlidersHorizontal />
          <span className="hidden sm:inline">Filters</span>
          {advancedCount > 0 && <span className="tabular">({advancedCount})</span>}
        </Button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-2 gap-2 rounded-2xl border bg-card p-3 md:grid-cols-5">
          <Select
            value={type}
            onValueChange={(v) => {
              const catType = categories.find((c) => c.id === category)?.type;
              update({ type: v, category: v !== ALL && catType !== v ? null : category });
            }}
          >
            <SelectTrigger className="h-10 w-full" aria-label="Type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              {TRANSACTION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={(v) => update({ category: v })}>
            <SelectTrigger className="h-10 w-full" aria-label="Category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-72">
              <SelectItem value={ALL}>All categories</SelectItem>
              {categoryOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                  {type === ALL && (
                    <span className="text-xs text-muted-foreground">
                      {c.type === "returned" ? "Returned" : TYPE_LABELS[c.type]}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => update({ from: e.target.value })}
            aria-label="From date"
            className="h-10"
          />
          <Input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => update({ to: e.target.value })}
            aria-label="To date"
            className="h-10"
          />

          <Button
            variant="ghost"
            className="col-span-2 h-10 md:col-span-1"
            disabled={!hasAny}
            onClick={() => {
              setQ("");
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
          >
            <X /> Clear
          </Button>
        </div>
      )}
    </div>
  );
}
