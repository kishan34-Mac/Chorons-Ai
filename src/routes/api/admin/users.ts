import { createFileRoute } from "@tanstack/react-router";
import { adminController } from "@/controllers";
import { wrapEndpoint } from "@/utils/endpoint";

export const Route = createFileRoute("/api/admin/users")({
  server: {
    handlers: {
      GET: wrapEndpoint(async (request) => adminController.getUsers(request), { skipCSRF: true }),
    },
  },
});
