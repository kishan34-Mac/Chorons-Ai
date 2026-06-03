import { createFileRoute } from "@tanstack/react-router";
import { adminController } from "@/controllers";
import { wrapEndpoint } from "@/utils/endpoint";

export const Route = createFileRoute("/api/admin/analytics")({
  server: {
    handlers: {
      GET: wrapEndpoint(async (request) => adminController.getAnalytics(request), {
        skipCSRF: true,
      }),
    },
  },
});
