import { createFileRoute } from "@tanstack/react-router";
import { adminController } from "@/controllers";
import { wrapEndpoint } from "@/utils/endpoint";

export const Route = createFileRoute("/api/admin/audit-logs")({
  server: {
    handlers: {
      GET: wrapEndpoint(async (request) => adminController.getAuditLogs(request), {
        skipCSRF: true,
      }),
    },
  },
});
