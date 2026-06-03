import { createFileRoute } from "@tanstack/react-router";
import { websiteController } from "@/controllers";
import { wrapEndpoint } from "@/utils/endpoint";

export const Route = createFileRoute("/api/website/$domain")({
  server: {
    handlers: {
      GET: wrapEndpoint(
        async (request, params) => websiteController.getWebsite(request, params.domain),
        { skipCSRF: true },
      ),
    },
  },
});
