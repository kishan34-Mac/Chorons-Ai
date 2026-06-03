import { createFileRoute } from "@tanstack/react-router";
import { userController } from "@/controllers";
import { wrapEndpoint } from "@/utils/endpoint";

export const Route = createFileRoute("/api/user/favorites")({
  server: {
    handlers: {
      GET: wrapEndpoint(async (request) => userController.getFavorites(request), {
        skipCSRF: true,
      }),
    },
  },
});
