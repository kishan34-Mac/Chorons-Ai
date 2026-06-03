import { createFileRoute } from "@tanstack/react-router";
import { connectToDatabase } from "@/config/mongoose";
import mongoose from "mongoose";
import { wrapEndpoint } from "@/utils/endpoint";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: wrapEndpoint(
        async () => {
          let dbStatus = "disconnected";
          try {
            await connectToDatabase();
            dbStatus = mongoose.connection.readyState === 1 ? "connected" : "connecting";
          } catch (err) {
            dbStatus = "error";
          }

          return new Response(
            JSON.stringify({
              status: "UP",
              timestamp: new Date().toISOString(),
              database: dbStatus,
            }),
            {
              status: dbStatus === "connected" ? 200 : 503,
              headers: { "Content-Type": "application/json" },
            },
          );
        },
        { skipCSRF: true },
      ),
    },
  },
});
