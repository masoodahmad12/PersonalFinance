import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { TRANSACTION_TYPES } from "@/lib/constants";

const transactionSchema = new Schema(
  {
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    amount: { type: Number, required: true, min: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    date: { type: Date, required: true },
    note: { type: String, trim: true, maxlength: 200 },
    recurringId: { type: Schema.Types.ObjectId, ref: "Recurring" },
  },
  { timestamps: true },
);

transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ categoryId: 1, date: -1 });
transactionSchema.index(
  { recurringId: 1, date: 1 },
  { unique: true, partialFilterExpression: { recurringId: { $exists: true } } },
);

export type TransactionDoc = InferSchemaType<typeof transactionSchema>;

export const Transaction: Model<TransactionDoc> =
  (models.Transaction as Model<TransactionDoc>) ||
  model<TransactionDoc>("Transaction", transactionSchema);
