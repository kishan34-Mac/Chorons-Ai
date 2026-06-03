import { Schema, model, models, Document, Types } from "mongoose";

export interface IComparison extends Document {
  userId?: Types.ObjectId;
  websiteId: Types.ObjectId;
  yearA: number;
  yearB: number;
  comparisonResult: Record<string, unknown>;
  aiSummary: string;
  createdAt: Date;
}

const comparisonSchema = new Schema<IComparison>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    websiteId: { type: Schema.Types.ObjectId, ref: "Website", required: true, index: true },
    yearA: { type: Number, required: true },
    yearB: { type: Number, required: true },
    comparisonResult: { type: Schema.Types.Mixed, default: {} },
    aiSummary: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const Comparison = models.Comparison || model<IComparison>("Comparison", comparisonSchema);
