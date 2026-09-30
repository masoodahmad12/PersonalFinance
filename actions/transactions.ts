"use server";

import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { fromYmd } from "@/lib/dates";
import {
  firstIssue,
  transactionSchema,
  type ActionResult,
  type TransactionInput,
} from "@/lib/validations";
import { Category } from "@/models/Category";
import { Transaction } from "@/models/Transaction";

async function validate(input: TransactionInput) {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssue(parsed.error) } as const;

  await connectDB();
  const category = await Category.findById(parsed.data.categoryId).lean();
  if (!category) return { error: "Category not found." } as const;
  if (category.type !== parsed.data.type) {
    return { error: "Category doesn't match the transaction type." } as const;
  }
  return {
    data: {
      type: parsed.data.type,
      amount: Math.round(parsed.data.amount * 100) / 100,
      categoryId: parsed.data.categoryId,
      date: fromYmd(parsed.data.date),
      note: parsed.data.note || undefined,
    },
  } as const;
}

export async function createTransaction(input: TransactionInput): Promise<ActionResult> {
  await requireAuth();
  const result = await validate(input);
  if ("error" in result) return { ok: false, error: result.error! };
  await Transaction.create(result.data);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<ActionResult> {
  await requireAuth();
  if (!Types.ObjectId.isValid(id)) return { ok: false, error: "Transaction not found." };
  const result = await validate(input);
  if ("error" in result) return { ok: false, error: result.error! };
  const { note, ...rest } = result.data;
  const res = await Transaction.updateOne(
    { _id: id },
    note ? { $set: { ...rest, note } } : { $set: rest, $unset: { note: 1 } },
  );
  if (!res.matchedCount) return { ok: false, error: "Transaction not found." };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  await requireAuth();
  if (!Types.ObjectId.isValid(id)) return { ok: false, error: "Transaction not found." };
  await connectDB();
  await Transaction.deleteOne({ _id: id });
  revalidatePath("/", "layout");
  return { ok: true };
}
