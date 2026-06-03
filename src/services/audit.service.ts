import { auditLogRepository } from "../repositories";

export class AuditService {
  async log(params: {
    userId?: string;
    action: string;
    resource: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      // Save asynchronously
      await auditLogRepository.create(params);
    } catch (err) {
      console.error("Failed to write audit log:", err);
    }
  }
}

export const auditService = new AuditService();
