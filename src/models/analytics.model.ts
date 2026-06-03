import { Schema, model, models, Document, Types } from "mongoose";

export interface IAnalytics extends Document {
  eventType: string;
  userId?: Types.ObjectId;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    eventType: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const Analytics = models.Analytics || model<IAnalytics>("Analytics", analyticsSchema);
