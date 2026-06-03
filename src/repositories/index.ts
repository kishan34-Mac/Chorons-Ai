import { BaseRepository, PaginatedResult } from "./base.repository";
import { User, IUser } from "../models/user.model";
import { SearchHistory, ISearchHistory } from "../models/search.model";
import { Website, IWebsite } from "../models/website.model";
import { Snapshot, ISnapshot } from "../models/snapshot.model";
import { Analysis, IAnalysis } from "../models/analysis.model";
import { Comparison, IComparison } from "../models/comparison.model";
import { Favorite, IFavorite } from "../models/favorite.model";
import { Report, IReport } from "../models/report.model";
import { Analytics, IAnalytics } from "../models/analytics.model";
import { UserSettings, IUserSettings } from "../models/settings.model";
import { AuditLog, IAuditLog } from "../models/audit.model";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email });
  }
}

export class SearchHistoryRepository extends BaseRepository<ISearchHistory> {
  constructor() {
    super(SearchHistory);
  }

  async getUserHistory(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<ISearchHistory>> {
    return this.findPaginated({ userId }, { page, limit, sort: { searchedAt: -1 } });
  }
}

export class WebsiteRepository extends BaseRepository<IWebsite> {
  constructor() {
    super(Website);
  }

  async findByDomain(domain: string): Promise<IWebsite | null> {
    return this.findOne({ domain: domain.trim().toLowerCase() });
  }
}

export class SnapshotRepository extends BaseRepository<ISnapshot> {
  constructor() {
    super(Snapshot);
  }

  async findByWebsiteId(
    websiteId: string,
    sort: Record<string, 1 | -1> = { timestamp: 1 },
  ): Promise<ISnapshot[]> {
    return this.find({ websiteId }, { sort });
  }

  async findLatestForWebsite(websiteId: string): Promise<ISnapshot | null> {
    const snaps = await this.find({ websiteId }, { sort: { timestamp: -1 }, limit: 1 });
    return snaps[0] || null;
  }
}

export class AnalysisRepository extends BaseRepository<IAnalysis> {
  constructor() {
    super(Analysis);
  }

  async findLatestForWebsite(websiteId: string): Promise<IAnalysis | null> {
    const results = await this.find({ websiteId }, { sort: { createdAt: -1 }, limit: 1 });
    return results[0] || null;
  }
}

export class ComparisonRepository extends BaseRepository<IComparison> {
  constructor() {
    super(Comparison);
  }

  async findComparison(
    websiteId: string,
    yearA: number,
    yearB: number,
  ): Promise<IComparison | null> {
    return this.findOne({ websiteId, yearA, yearB });
  }
}

export class FavoriteRepository extends BaseRepository<IFavorite> {
  constructor() {
    super(Favorite);
  }

  async getUserFavorites(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<IFavorite>> {
    return this.findPaginated({ userId }, { page, limit, populate: "websiteId" });
  }

  async isFavorite(userId: string, websiteId: string): Promise<boolean> {
    const fav = await this.findOne({ userId, websiteId });
    return !!fav;
  }
}

export class ReportRepository extends BaseRepository<IReport> {
  constructor() {
    super(Report);
  }

  async getUserReports(userId: string, page = 1, limit = 10): Promise<PaginatedResult<IReport>> {
    return this.findPaginated({ userId }, { page, limit, populate: "websiteId" });
  }
}

export class AnalyticsRepository extends BaseRepository<IAnalytics> {
  constructor() {
    super(Analytics);
  }
}

export class UserSettingsRepository extends BaseRepository<IUserSettings> {
  constructor() {
    super(UserSettings);
  }

  async findByUserId(userId: string): Promise<IUserSettings | null> {
    return this.findOne({ userId });
  }
}

export class AuditLogRepository extends BaseRepository<IAuditLog> {
  constructor() {
    super(AuditLog);
  }

  async getLogs(page = 1, limit = 20): Promise<PaginatedResult<IAuditLog>> {
    return this.findPaginated({}, { page, limit, sort: { createdAt: -1 }, populate: "userId" });
  }
}

// Export singletons
export const userRepository = new UserRepository();
export const searchHistoryRepository = new SearchHistoryRepository();
export const websiteRepository = new WebsiteRepository();
export const snapshotRepository = new SnapshotRepository();
export const analysisRepository = new AnalysisRepository();
export const comparisonRepository = new ComparisonRepository();
export const favoriteRepository = new FavoriteRepository();
export const reportRepository = new ReportRepository();
export const analyticsRepository = new AnalyticsRepository();
export const userSettingsRepository = new UserSettingsRepository();
export const auditLogRepository = new AuditLogRepository();
