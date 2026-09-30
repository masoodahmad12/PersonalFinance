"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createRecurring, updateRecurring } from "@/actions/recurring";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FREQUENCIES, FREQUENCY_LABELS } from "@/lib/constants";
import { todayYmd } from "@/lib/dates";
import { describeSchedule } from "@/lib/recurring-format";
import type { RecurringDTO } from "@/lib/types";
import { recurringSchema, type RecurringInput } from "@/lib/validations";
import { CategorySelect } from "./category-select";
import { Field } from "./field";
import { TypeSegmented } from "./type-segmented";

export function RecurringForm({
  rule,
  onDone,
}: {
  rule?: RecurringDTO | null;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const isEdit = !!rule;

  const form = useForm<RecurringInput>({
    resolver: zodResolver(recurringSchema),
    defaultValues: rule
      ? {
          type: rule.type,
          amount: rule.amount,
          categoryId: rule.categoryId,
          note: rule.note,
          frequency: rule.frequency,
          interval: rule.interval,
          startDate: rule.startDate,
          endDate: rule.endDate ?? "",
        }
      : {
          type: "expense",
          amount: undefined,
          categoryId: "",
          note: "",
          frequency: "monthly",
          interval: 1,
          startDate: todayYmd(),
          endDate: "",
        },
  });
  const { errors } = form.formState;
  const [type, frequency, interval, startDate] = form.watch([
    "type",
    "frequency",
    "interval",
    "startDate",
  ]);

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const res = isEdit ? await updateRecurring(rule.id, values) : await createRecurring(values);
      if (!res.ok) return void toast.error(res.error);
      toast.success(isEdit ? "Recurring item updated" : "Recurring item created");
      onDone();
    }),
  );

  const backfill = !isEdit && startDate && startDate < todayYmd();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Controller
        control={form.control}
        name="type"
        render={({ field }) => (
          <TypeSegmented
            value={field.value}
            onChange={(t) => {
              field.onChange(t);
              form.setValue("categoryId", "");
            }}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount (PKR)" htmlFor="rec-amount" error={errors.amount?.message}>
          <Input
            id="rec-amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0"
            className="h-10 font-semibold tabular"
            aria-invalid={!!errors.amount}
            {...form.register("amount", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Category" htmlFor="rec-category" error={errors.categoryId?.message}>
          <Controller
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <CategorySelect
                id="rec-category"
                type={type}
                value={field.value}
                onChange={field.onChange}
                invalid={!!errors.categoryId}
              />
            )}
          />
        </Field>
      </div>

      <Field label="Repeats" error={errors.interval?.message}>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Every</span>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={365}
            className="h-10 w-20 tabular"
            aria-label="Interval"
            {...form.register("interval", { valueAsNumber: true })}
          />
          <Controller
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-10 flex-1" aria-label="Frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {interval === 1 ? FREQUENCY_LABELS[f].one : FREQUENCY_LABELS[f].many}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        {Number.isInteger(interval) && interval > 0 && (
          <p className="text-xs text-muted-foreground">{describeSchedule(frequency, interval)}</p>
        )}
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Starts on" htmlFor="rec-start" error={errors.startDate?.message}>
          <Input id="rec-start" type="date" className="h-10" {...form.register("startDate")} />
        </Field>
        <Field label="Ends on (optional)" htmlFor="rec-end" error={errors.endDate?.message}>
          <Input id="rec-end" type="date" className="h-10" {...form.register("endDate")} />
        </Field>
      </div>

      <Field label="Note (optional)" htmlFor="rec-note" error={errors.note?.message}>
        <Input id="rec-note" placeholder="e.g. House rent" className="h-10" {...form.register("note")} />
      </Field>

      {backfill && (
        <p className="rounded-lg bg-returned/10 px-3 py-2 text-xs text-foreground">
          The start date is in the past, so every occurrence up to today will be added right away.
        </p>
      )}

      <Button type="submit" size="lg" className="h-10 w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        {isEdit ? "Save changes" : "Create recurring item"}
      </Button>
    </form>
  );
}
