import { createFileRoute } from "@tanstack/react-router";
import { userController } from "@/controllers";
import { wrapEndpoint } from "@/utils/endpoint";

export const Route = createFileRoute("/api/user/history")({
  server: {
    handlers: {
      GET: wrapEndpoint(async (request) => userController.getHistory(request), { skipCSRF: true }),
    },
  },
});
