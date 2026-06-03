import { logger } from "../utils/logger";
import { searchHistoryRepository, auditLogRepository } from "../repositories";

export class BackgroundJobs {
  static startCleanupJobs() {
    // Run cleanup every 24 hours
    setInterval(
      async () => {
        logger.info("Starting background database cleanup jobs...");
        try {
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

          // Cleanup old failed searches
          const deletedSearches = await searchHistoryRepository.deleteMany({
            status: "failed",
            searchedAt: { $lt: thirtyDaysAgo },
          });

          // Cleanup old audit logs
          const deletedAudits = await auditLogRepository.deleteMany({
            createdAt: { $lt: thirtyDaysAgo },
          });

          logger.info("Database cleanup completed successfully", {
            deletedSearches: deletedSearches?.deletedCount || 0,
            deletedAudits: deletedAudits?.deletedCount || 0,
          });
        } catch (err) {
          logger.error("Database cleanup background job failed:", {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      },
      24 * 60 * 60 * 1000,
    ); // 24 hours
  }
}
