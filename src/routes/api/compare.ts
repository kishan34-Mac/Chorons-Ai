import { createFileRoute } from "@tanstack/react-router";
import { websiteController } from "@/controllers";
import { wrapEndpoint } from "@/utils/endpoint";

export const Route = createFileRoute("/api/compare")({
  server: {
    handlers: {
      POST: wrapEndpoint(async (request) => websiteController.compare(request)),
    },
  },
});
