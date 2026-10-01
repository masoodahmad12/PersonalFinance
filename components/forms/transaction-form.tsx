"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createTransaction, deleteTransaction, updateTransaction } from "@/actions/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmButton } from "@/components/confirm-button";
import { useIsDesktop } from "@/hooks/use-media-query";
import { todayYmd } from "@/lib/dates";
import type { TransactionType } from "@/lib/constants";
import type { TransactionDTO } from "@/lib/types";
import { transactionSchema, type TransactionInput } from "@/lib/validations";
import { CategorySelect } from "./category-select";
import { Field } from "./field";
import { TypeSegmented } from "./type-segmented";

export function TransactionForm({
  transaction,
  defaultType = "expense",
  onDone,
}: {
  transaction?: TransactionDTO | null;
  defaultType?: TransactionType;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const isEdit = !!transaction;
  const isDesktop = useIsDesktop();

  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          type: transaction.type,
          amount: transaction.amount,
          categoryId: transaction.categoryId,
          date: transaction.date,
          note: transaction.note,
        }
      : { type: defaultType, amount: undefined, categoryId: "", date: todayYmd(), note: "" },
  });
  const { errors } = form.formState;
  const type = form.watch("type");

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const res = isEdit
        ? await updateTransaction(transaction.id, values)
        : await createTransaction(values);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(isEdit ? "Transaction updated" : "Transaction added");
      onDone();
    });
  });

  const onDelete = () =>
    startTransition(async () => {
      if (!transaction) return;
      const res = await deleteTransaction(transaction.id);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Transaction deleted");
      onDone();
    });

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

      <Field label="Amount (PKR)" htmlFor="tx-amount" error={errors.amount?.message}>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
            Rs
          </span>
          <Input
            id="tx-amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0"
            autoFocus={!isEdit && isDesktop}
            className="h-12 pl-10 text-lg font-semibold tabular"
            aria-invalid={!!errors.amount}
            {...form.register("amount", { valueAsNumber: true })}
          />
        </div>
      </Field>

      <Field label="Category" htmlFor="tx-category" error={errors.categoryId?.message}>
        <Controller
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <CategorySelect
              id="tx-category"
              type={type}
              value={field.value}
              onChange={field.onChange}
              invalid={!!errors.categoryId}
            />
          )}
        />
      </Field>

      <Field label="Date" htmlFor="tx-date" error={errors.date?.message}>
        <Input id="tx-date" type="date" className="h-10" {...form.register("date")} />
      </Field>

      <Field label="Note (optional)" htmlFor="tx-note" error={errors.note?.message}>
        <Textarea
          id="tx-note"
          rows={2}
          placeholder="What was this for?"
          className="resize-none"
          {...form.register("note")}
        />
      </Field>

      <div className="flex gap-2 pt-1">
        {isEdit && (
          <ConfirmButton
            title="Delete this transaction?"
            description="This can't be undone."
            onConfirm={onDelete}
            disabled={pending}
          >
            <Button type="button" variant="destructive" size="lg" className="h-10" disabled={pending}>
              <Trash2 />
            </Button>
          </ConfirmButton>
        )}
        <Button type="submit" size="lg" className="h-10 flex-1" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          {isEdit ? "Save changes" : "Add transaction"}
        </Button>
      </div>
    </form>
  );
}
