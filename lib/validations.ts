import { z } from "zod";
import { FREQUENCIES, TRANSACTION_TYPES } from "./constants";
import { isValidYmd } from "./dates";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Pick a category");
const ymd = z.string().refine(isValidYmd, "Pick a valid date");
const amount = z
  .number({ error: "Enter an amount" })
  .positive("Amount must be greater than 0")
  .max(1_000_000_000, "Amount is too large");
const note = z.string().trim().max(200, "Keep notes under 200 characters").optional();

export const transactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  amount,
  categoryId: objectId,
  date: ymd,
  note,
});
export type TransactionInput = z.infer<typeof transactionSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Keep it under 50 characters"),
  type: z.enum(TRANSACTION_TYPES),
  color: z.string().regex(/^#[0-9a-f]{6}$/i, "Pick a color"),
  icon: z.string().min(1).max(40),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const recurringSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES),
    amount,
    categoryId: objectId,
    note,
    frequency: z.enum(FREQUENCIES),
    interval: z
      .number({ error: "Enter a number" })
      .int("Whole numbers only")
      .min(1, "At least 1")
      .max(365, "At most 365"),
    startDate: ymd,
    endDate: z.union([ymd, z.literal("")]).optional(),
  })
  .refine((v) => !v.endDate || v.endDate >= v.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });
export type RecurringInput = z.infer<typeof recurringSchema>;

export type ActionResult = { ok: true } | { ok: false; error: string };

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}
