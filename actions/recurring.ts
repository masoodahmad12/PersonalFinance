"use server";

import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { fromYmd, toYmd, todayYmd } from "@/lib/dates";
import { processDueRecurring, scheduleFrom } from "@/lib/recurring";
import {
  firstIssue,
  recurringSchema,
  type ActionResult,
  type RecurringInput,
} from "@/lib/validations";
import { Category } from "@/models/Category";
import { Recurring } from "@/models/Recurring";

async function validate(input: RecurringInput) {
  const parsed = recurringSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssue(parsed.error) } as const;
  await connectDB();
  const category = await Category.findById(parsed.data.categoryId).lean();
  if (!category) return { error: "Category not found." } as const;
  if (category.type !== parsed.data.type) {
    return { error: "Category doesn't match the transaction type." } as const;
  }
  return { data: parsed.data } as const;
}

export async function createRecurring(input: RecurringInput): Promise<ActionResult> {
  await requireAuth();
  const result = await validate(input);
  if ("error" in result) return { ok: false, error: result.error! };
  const d = result.data;

  await Recurring.create({
    type: d.type,
    amount: Math.round(d.amount * 100) / 100,
    categoryId: d.categoryId,
    note: d.note || undefined,
    frequency: d.frequency,
    interval: d.interval,
    startDate: fromYmd(d.startDate),
    endDate: d.endDate ? fromYmd(d.endDate) : undefined,
    runCount: 0,
    nextRunDate: fromYmd(d.startDate),
    isActive: true,
  });
  await processDueRecurring();
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateRecurring(id: string, input: RecurringInput): Promise<ActionResult> {
  await requireAuth();
  if (!Types.ObjectId.isValid(id)) return { ok: false, error: "Recurring item not found." };
  const result = await validate(input);
  if ("error" in result) return { ok: false, error: result.error! };
  const d = result.data;

  const rule = await Recurring.findById(id);
  if (!rule) return { ok: false, error: "Recurring item not found." };

  const scheduleChanged =
    toYmd(rule.startDate) !== d.startDate ||
    rule.frequency !== d.frequency ||
    rule.interval !== d.interval;

  rule.set({
    type: d.type,
    amount: Math.round(d.amount * 100) / 100,
    categoryId: d.categoryId,
    note: d.note || undefined,
    frequency: d.frequency,
    interval: d.interval,
    startDate: fromYmd(d.startDate),
    endDate: d.endDate ? fromYmd(d.endDate) : undefined,
  });

  if (scheduleChanged) {
    // Past occurrences were already posted; only schedule from today onward
    // (or from the start date if nothing has been posted yet).
    const from = rule.runCount === 0 ? d.startDate : todayYmd();
    const { runCount, nextRunDate } = scheduleFrom(d.startDate, d.frequency, d.interval, from);
    rule.runCount = runCount;
    rule.nextRunDate = fromYmd(nextRunDate);
  }
  if (d.endDate && toYmd(rule.nextRunDate) > d.endDate) rule.isActive = false;

  await rule.save();
  await processDueRecurring();
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setRecurringActive(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAuth();
  if (!Types.ObjectId.isValid(id)) return { ok: false, error: "Recurring item not found." };
  await connectDB();
  const rule = await Recurring.findById(id);
  if (!rule) return { ok: false, error: "Recurring item not found." };

  if (isActive) {
    const endYmd = rule.endDate ? toYmd(rule.endDate) : null;
    // Resuming skips the paused period instead of back-filling it.
    const { runCount, nextRunDate } = scheduleFrom(
      toYmd(rule.startDate),
      rule.frequency,
      rule.interval,
      todayYmd() > toYmd(rule.nextRunDate) ? todayYmd() : toYmd(rule.nextRunDate),
    );
    if (endYmd && nextRunDate > endYmd) {
      return { ok: false, error: "This schedule has already ended. Edit the end date first." };
    }
    rule.runCount = runCount;
    rule.nextRunDate = fromYmd(nextRunDate);
  }
  rule.isActive = isActive;
  await rule.save();
  if (isActive) await processDueRecurring();
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteRecurring(id: string): Promise<ActionResult> {
  await requireAuth();
  if (!Types.ObjectId.isValid(id)) return { ok: false, error: "Recurring item not found." };
  await connectDB();
  await Recurring.deleteOne({ _id: id });
  revalidatePath("/", "layout");
  return { ok: true };
}
