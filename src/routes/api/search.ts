import { createFileRoute } from "@tanstack/react-router";
import { searchController } from "@/controllers";
import { wrapEndpoint } from "@/utils/endpoint";

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      POST: wrapEndpoint(async (request) => searchController.search(request)),
    },
  },
});
