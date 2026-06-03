import { Schema, model, models, Document, Types } from "mongoose";

export interface IUserSettings extends Document {
  userId: Types.ObjectId;
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    updates: boolean;
  };
  preferences: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const userSettingsSchema = new Schema<IUserSettings>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    notifications: {
      email: { type: Boolean, default: true },
      updates: { type: Boolean, default: false },
    },
    preferences: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
);

export const UserSettings =
  models.UserSettings || model<IUserSettings>("UserSettings", userSettingsSchema);
