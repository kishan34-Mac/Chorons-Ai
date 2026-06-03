import { Schema, model, models, Document, Types } from "mongoose";

export interface IFavorite extends Document {
  userId: Types.ObjectId;
  websiteId: Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    websiteId: { type: Schema.Types.ObjectId, ref: "Website", required: true, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Prevent duplicate favorites for a user on the same website
favoriteSchema.index({ userId: 1, websiteId: 1 }, { unique: true });

export const Favorite = models.Favorite || model<IFavorite>("Favorite", favoriteSchema);
