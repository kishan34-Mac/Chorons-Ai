import mongoose from "mongoose";
import { config } from "./index";

let isConnected = false;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  // Monitor connection events
  mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to MongoDB Atlas");
  });

  mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("Mongoose disconnected from MongoDB");
  });

  try {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };
    const db = await mongoose.connect(config.MONGODB_URI, opts);
    isConnected = db.connections[0].readyState === 1;
    return db;
  } catch (error) {
    console.error("Error connecting Mongoose to MongoDB:", error);
    throw error;
  }
}
