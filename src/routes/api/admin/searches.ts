import { createFileRoute } from "@tanstack/react-router";
import { adminController } from "@/controllers";
import { wrapEndpoint } from "@/utils/endpoint";

export const Route = createFileRoute("/api/admin/searches")({
  server: {
    handlers: {
      GET: wrapEndpoint(async (request) => adminController.getSearches(request), {
        skipCSRF: true,
      }),
    },
  },
});
