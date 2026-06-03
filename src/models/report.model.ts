import { Schema, model, models, Document, Types } from "mongoose";

export interface IReport extends Document {
  userId: Types.ObjectId;
  websiteId: Types.ObjectId;
  reportUrl: string;
  reportType: "pdf" | "html" | "json";
  createdAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    websiteId: { type: Schema.Types.ObjectId, ref: "Website", required: true, index: true },
    reportUrl: { type: String, required: true },
    reportType: { type: String, enum: ["pdf", "html", "json"], default: "pdf" },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const Report = models.Report || model<IReport>("Report", reportSchema);
