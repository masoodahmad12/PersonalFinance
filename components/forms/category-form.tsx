"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createCategory, updateCategory } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryIcon } from "@/components/category-icon";
import { useIsDesktop } from "@/hooks/use-media-query";
import { CATEGORY_COLORS, type TransactionType } from "@/lib/constants";
import { CATEGORY_ICONS } from "@/lib/icons";
import type { CategoryDTO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { categorySchema, type CategoryInput } from "@/lib/validations";
import { Field } from "./field";
import { TypeSegmented } from "./type-segmented";

export function CategoryForm({
  category,
  defaultType,
  onDone,
}: {
  category?: CategoryDTO | null;
  defaultType: TransactionType;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const isEdit = !!category;
  const isDesktop = useIsDesktop();

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? { name: category.name, type: category.type, color: category.color, icon: category.icon }
      : { name: "", type: defaultType, color: CATEGORY_COLORS[0], icon: "wallet" },
  });
  const { errors } = form.formState;
  const [name, color, icon] = form.watch(["name", "color", "icon"]);

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const res = isEdit ? await updateCategory(category.id, values) : await createCategory(values);
      if (!res.ok) return void toast.error(res.error);
      toast.success(isEdit ? "Category updated" : "Category created");
      onDone();
    }),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Controller
        control={form.control}
        name="type"
        render={({ field }) => <TypeSegmented value={field.value} onChange={field.onChange} />}
      />

      <div className="flex items-end gap-3">
        <CategoryIcon icon={icon} color={color} size="lg" />
        <Field label="Name" htmlFor="cat-name" error={errors.name?.message} className="flex-1">
          <Input
            id="cat-name"
            placeholder="e.g. Groceries"
            autoFocus={!isEdit && isDesktop}
            className="h-10"
            aria-invalid={!!errors.name}
            {...form.register("name")}
          />
        </Field>
      </div>

      <Field label="Color">
        <Controller
          control={form.control}
          name="color"
          render={({ field }) => (
            <div className="grid grid-cols-8 gap-2">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => field.onChange(c)}
                  className="flex aspect-square w-full max-w-9 items-center justify-center justify-self-center rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-110 data-[active=true]:ring-2"
                  data-active={field.value === c}
                  style={{ backgroundColor: c, ["--tw-ring-color" as string]: c }}
                  aria-label={`Color ${c}`}
                >
                  {field.value === c && <Check className="size-4 text-white" />}
                </button>
              ))}
            </div>
          )}
        />
      </Field>

      <Field label="Icon">
        <Controller
          control={form.control}
          name="icon"
          render={({ field }) => (
            <div className="grid max-h-40 grid-cols-8 gap-1.5 overflow-y-auto rounded-xl border p-2">
              {Object.entries(CATEGORY_ICONS).map(([key, Icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => field.onChange(key)}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    field.value === key && "text-white",
                  )}
                  style={field.value === key ? { backgroundColor: color } : undefined}
                  aria-label={key}
                >
                  <Icon className="size-4.5" />
                </button>
              ))}
            </div>
          )}
        />
      </Field>

      <Button type="submit" size="lg" className="h-10 w-full" disabled={pending || !name?.trim()}>
        {pending && <Loader2 className="animate-spin" />}
        {isEdit ? "Save changes" : "Create category"}
      </Button>
    </form>
  );
}
