import { Schema, model, models, Document, Types } from "mongoose";

export interface IAnalysis extends Document {
  userId?: Types.ObjectId;
  websiteId: Types.ObjectId;
  aiSummary: string;
  designEvolution: string;
  redesignPeriods: string[];
  modernizationScore: number;
  nostalgiaScore: number;
  createdAt: Date;
}

const analysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    websiteId: { type: Schema.Types.ObjectId, ref: "Website", required: true, index: true },
    aiSummary: { type: String, required: true },
    designEvolution: { type: String, required: true },
    redesignPeriods: { type: [String], default: [] },
    modernizationScore: { type: Number, min: 0, max: 100, required: true },
    nostalgiaScore: { type: Number, min: 0, max: 100, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const Analysis = models.Analysis || model<IAnalysis>("Analysis", analysisSchema);
