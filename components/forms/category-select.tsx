"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { Drawer as DrawerPrimitive } from "vaul";
import { CategoryIcon } from "@/components/category-icon";
import { useCategories } from "@/components/providers/categories-provider";
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsDesktop } from "@/hooks/use-media-query";
import type { TransactionType } from "@/lib/constants";
import type { CategoryDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategorySelectProps = {
  type: TransactionType;
  value: string;
  onChange: (id: string) => void;
  invalid?: boolean;
  id?: string;
};

export function CategorySelect({ type, value, onChange, invalid, id }: CategorySelectProps) {
  const categories = useCategories();
  const isDesktop = useIsDesktop();
  const options = useMemo(
    () => categories.filter((c) => c.type === type && (!c.isArchived || c.id === value)),
    [categories, type, value],
  );

  if (options.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
        No categories for this type yet.{" "}
        <Link href="/categories" className="font-medium text-primary underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    );
  }

  if (!isDesktop) {
    return <CategorySheet options={options} value={value} onChange={onChange} invalid={invalid} id={id} />;
  }

  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger id={id} className="h-10 w-full" aria-invalid={invalid}>
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-72">
        {options.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            <CategoryIcon icon={c.icon} color={c.color} size="sm" className="size-6" />
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Radix Select's portaled list fights the surrounding vaul drawer for touch scrolling on iOS,
 * so on mobile the options open in a nested drawer instead.
 */
function CategorySheet({
  options,
  value,
  onChange,
  invalid,
  id,
}: Omit<CategorySelectProps, "type"> & { options: CategoryDTO[] }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((c) => c.id === value);

  return (
    <DrawerPrimitive.NestedRoot open={open} onOpenChange={setOpen}>
      <button
        type="button"
        id={id}
        data-invalid={invalid || undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          setOpen(true);
        }}
        className="flex h-10 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 dark:bg-input/30 dark:data-invalid:border-destructive/50 dark:data-invalid:ring-destructive/40"
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-1.5">
            <CategoryIcon icon={selected.icon} color={selected.color} size="sm" className="size-6" />
            <span className="truncate">{selected.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Select a category</span>
        )}
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </button>

      <DrawerContent className="max-h-[80dvh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Choose a category</DrawerTitle>
          <DrawerDescription className="sr-only">Choose a category</DrawerDescription>
        </DrawerHeader>
        <div role="listbox" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4 pb-safe">
          {options.map((c) => {
            const active = c.id === value;
            return (
              <button
                key={c.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-base active:bg-accent",
                  active && "bg-accent text-accent-foreground",
                )}
              >
                <CategoryIcon icon={c.icon} color={c.color} size="sm" />
                <span className="flex-1 truncate">{c.name}</span>
                {active && <CheckIcon className="size-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </DrawerContent>
    </DrawerPrimitive.NestedRoot>
  );
}
