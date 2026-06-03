import { Schema, model, models, Document, Types } from "mongoose";

export interface ISnapshot extends Document {
  websiteId: Types.ObjectId;
  timestamp: string;
  archiveUrl: string;
  screenshotUrl?: string;
  metadata: Record<string, unknown>;
  technologies: string[];
  createdAt: Date;
}

const snapshotSchema = new Schema<ISnapshot>(
  {
    websiteId: { type: Schema.Types.ObjectId, ref: "Website", required: true, index: true },
    timestamp: { type: String, required: true, index: true },
    archiveUrl: { type: String, required: true },
    screenshotUrl: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
    technologies: { type: [String], default: [] },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Compound index to prevent duplicates for a specific website and timestamp
snapshotSchema.index({ websiteId: 1, timestamp: 1 }, { unique: true });

export const Snapshot = models.Snapshot || model<ISnapshot>("Snapshot", snapshotSchema);
