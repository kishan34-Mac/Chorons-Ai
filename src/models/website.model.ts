import { Schema, model, models, Document } from "mongoose";

export interface IWebsite extends Document {
  domain: string;
  title?: string;
  description?: string;
  favicon?: string;
  firstSnapshot?: string;
  latestSnapshot?: string;
  totalSnapshots: number;
  createdAt: Date;
  updatedAt: Date;
}

const websiteSchema = new Schema<IWebsite>(
  {
    domain: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    title: { type: String },
    description: { type: String },
    favicon: { type: String },
    firstSnapshot: { type: String },
    latestSnapshot: { type: String },
    totalSnapshots: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
);

export const Website = models.Website || model<IWebsite>("Website", websiteSchema);
