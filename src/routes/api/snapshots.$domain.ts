import { createFileRoute } from "@tanstack/react-router";
import { websiteController } from "@/controllers";
import { wrapEndpoint } from "@/utils/endpoint";

export const Route = createFileRoute("/api/snapshots/$domain")({
  server: {
    handlers: {
      GET: wrapEndpoint(
        async (request, params) => websiteController.getSnapshots(request, params.domain),
        { skipCSRF: true },
      ),
    },
  },
});
