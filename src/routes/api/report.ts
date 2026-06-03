import { createFileRoute } from "@tanstack/react-router";
import { websiteController } from "@/controllers";
import { wrapEndpoint } from "@/utils/endpoint";

export const Route = createFileRoute("/api/report")({
  server: {
    handlers: {
      POST: wrapEndpoint(async (request) => websiteController.generateReport(request)),
    },
  },
});
