"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { useCategories } from "@/components/providers/categories-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TransactionType } from "@/lib/constants";

export function CategorySelect({
  type,
  value,
  onChange,
  invalid,
  id,
}: {
  type: TransactionType;
  value: string;
  onChange: (id: string) => void;
  invalid?: boolean;
  id?: string;
}) {
  const categories = useCategories();
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
