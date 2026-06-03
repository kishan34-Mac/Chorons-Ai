import { Schema, model, models, Document, Types } from "mongoose";

export interface ISearchHistory extends Document {
  userId?: Types.ObjectId;
  searchTerm: string;
  normalizedDomain: string;
  searchedAt: Date;
  totalSnapshots: number;
  source: "wayback" | "cache" | "synthetic";
  status: "success" | "failed";
}

const searchHistorySchema = new Schema<ISearchHistory>({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  searchTerm: { type: String, required: true },
  normalizedDomain: { type: String, required: true, index: true, lowercase: true, trim: true },
  searchedAt: { type: Date, default: Date.now },
  totalSnapshots: { type: Number, default: 0 },
  source: { type: String, enum: ["wayback", "cache", "synthetic"], default: "wayback" },
  status: { type: String, enum: ["success", "failed"], default: "success" },
});

export const SearchHistory =
  models.SearchHistory || model<ISearchHistory>("SearchHistory", searchHistorySchema);
