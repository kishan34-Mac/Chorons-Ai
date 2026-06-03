import { analyticsRepository } from "../repositories";

export class AnalyticsService {
  async track(
    eventType: string,
    metadata: Record<string, unknown> = {},
    userId?: string,
  ): Promise<void> {
    try {
      await analyticsRepository.create({
        eventType,
        userId,
        metadata,
      });
    } catch (err) {
      console.error("Failed to save analytics event:", err);
    }
  }
}

export const analyticsService = new AnalyticsService();
