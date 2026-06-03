import { createFileRoute } from "@tanstack/react-router";
import { getRecentSearches } from "@/lib/db";

const DEFAULT_RECENT = [
  { domain: "apple.com", timestamp: new Date().toISOString(), snapshotsCount: 30 },
  { domain: "google.com", timestamp: new Date().toISOString(), snapshotsCount: 28 },
  { domain: "amazon.com", timestamp: new Date().toISOString(), snapshotsCount: 27 },
  { domain: "facebook.com", timestamp: new Date().toISOString(), snapshotsCount: 22 },
  { domain: "airbnb.com", timestamp: new Date().toISOString(), snapshotsCount: 18 },
];

export const Route = createFileRoute("/api/public/recent")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const recent = await getRecentSearches();
          const responseData = recent.length > 0 ? recent : DEFAULT_RECENT;

          return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=10", // short cache for recent searches list
            },
          });
        } catch (e) {
          console.error("Error in /api/public/recent endpoint:", e);
          return new Response(JSON.stringify(DEFAULT_RECENT), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
