import { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "github" | "credentials" | "magic-link";
  role: "user" | "premium" | "admin";
  plan: "free" | "premium" | "enterprise";
  isVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    avatar: { type: String },
    provider: {
      type: String,
      enum: ["google", "github", "credentials", "magic-link"],
      required: true,
    },
    role: { type: String, enum: ["user", "premium", "admin"], default: "user" },
    plan: { type: String, enum: ["free", "premium", "enterprise"], default: "free" },
    isVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
);

export const User = models.User || model<IUser>("User", userSchema);
