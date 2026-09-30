import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { FREQUENCIES, TRANSACTION_TYPES } from "@/lib/constants";

const recurringSchema = new Schema(
  {
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    amount: { type: Number, required: true, min: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    note: { type: String, trim: true, maxlength: 200 },
    frequency: { type: String, enum: FREQUENCIES, required: true },
    interval: { type: Number, required: true, min: 1, max: 365, default: 1 },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    // Occurrences are always derived from startDate + runCount so month-end dates don't drift.
    runCount: { type: Number, required: true, default: 0 },
    nextRunDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

recurringSchema.index({ isActive: 1, nextRunDate: 1 });

export type RecurringDoc = InferSchemaType<typeof recurringSchema>;

export const Recurring: Model<RecurringDoc> =
  (models.Recurring as Model<RecurringDoc>) || model<RecurringDoc>("Recurring", recurringSchema);
