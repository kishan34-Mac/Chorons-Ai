import { createFileRoute } from "@tanstack/react-router";
import { websiteController } from "@/controllers";
import { wrapEndpoint } from "@/utils/endpoint";

export const Route = createFileRoute("/api/timeline/$domain")({
  server: {
    handlers: {
      GET: wrapEndpoint(
        async (request, params) => websiteController.getTimeline(request, params.domain),
        { skipCSRF: true },
      ),
    },
  },
});
