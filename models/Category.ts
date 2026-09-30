import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { TRANSACTION_TYPES } from "@/lib/constants";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    color: { type: String, required: true, default: "#6366f1" },
    icon: { type: String, required: true, default: "wallet" },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

categorySchema.index({ type: 1, name: 1 });

export type CategoryDoc = InferSchemaType<typeof categorySchema>;

export const Category: Model<CategoryDoc> =
  (models.Category as Model<CategoryDoc>) || model<CategoryDoc>("Category", categorySchema);
