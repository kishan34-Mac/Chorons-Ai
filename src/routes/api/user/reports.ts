import { createFileRoute } from "@tanstack/react-router";
import { userController } from "@/controllers";
import { wrapEndpoint } from "@/utils/endpoint";

export const Route = createFileRoute("/api/user/reports")({
  server: {
    handlers: {
      GET: wrapEndpoint(async (request) => userController.getReports(request), { skipCSRF: true }),
    },
  },
});
