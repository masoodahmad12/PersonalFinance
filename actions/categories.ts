"use server";

import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ensureDefaultCategories } from "@/lib/data";
import { categorySchema, firstIssue, type ActionResult, type CategoryInput } from "@/lib/validations";
import { Category } from "@/models/Category";
import { Transaction } from "@/models/Transaction";
import { Recurring } from "@/models/Recurring";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function nameTaken(input: CategoryInput, excludeId?: string) {
  const existing = await Category.findOne({
    type: input.type,
    name: new RegExp(`^${escapeRegex(input.name)}$`, "i"),
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).lean();
  return !!existing;
}

export async function createCategory(input: CategoryInput): Promise<ActionResult> {
  await requireAuth();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  await connectDB();
  if (await nameTaken(parsed.data)) {
    return { ok: false, error: "A category with this name already exists." };
  }
  await Category.create(parsed.data);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateCategory(id: string, input: CategoryInput): Promise<ActionResult> {
  await requireAuth();
  if (!Types.ObjectId.isValid(id)) return { ok: false, error: "Category not found." };
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  await connectDB();
  const existing = await Category.findById(id);
  if (!existing) return { ok: false, error: "Category not found." };
  if (existing.type !== parsed.data.type) {
    const used = await Transaction.exists({ categoryId: id });
    if (used) return { ok: false, error: "This category is in use, so its type can't change." };
  }
  if (await nameTaken(parsed.data, id)) {
    return { ok: false, error: "A category with this name already exists." };
  }
  existing.set(parsed.data);
  await existing.save();
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setCategoryArchived(id: string, isArchived: boolean): Promise<ActionResult> {
  await requireAuth();
  if (!Types.ObjectId.isValid(id)) return { ok: false, error: "Category not found." };
  await connectDB();
  await Category.updateOne({ _id: id }, { isArchived });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAuth();
  if (!Types.ObjectId.isValid(id)) return { ok: false, error: "Category not found." };
  await connectDB();
  const [usedByTx, usedByRule] = await Promise.all([
    Transaction.exists({ categoryId: id }),
    Recurring.exists({ categoryId: id }),
  ]);
  if (usedByTx || usedByRule) {
    return { ok: false, error: "This category is in use. Archive it instead." };
  }
  await Category.deleteOne({ _id: id });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function restoreDefaultCategories(): Promise<ActionResult> {
  await requireAuth();
  await ensureDefaultCategories();
  revalidatePath("/", "layout");
  return { ok: true };
}
