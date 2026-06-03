import { connectToDatabase } from "../config/mongoose";
import { requireAuth, requireRole, validateBody, validateQuery, getClientIp } from "../middleware";
import { searchSchema, compareSchema, favoriteSchema, reportSchema } from "../validators";
import {
  searchService,
  aiService,
  auditService,
  analyticsService,
  storageService,
} from "../services";
import {
  userRepository,
  searchHistoryRepository,
  websiteRepository,
  snapshotRepository,
  favoriteRepository,
  reportRepository,
  analysisRepository,
  comparisonRepository,
  auditLogRepository,
  analyticsRepository,
} from "../repositories";

export class UserController {
  async getUser(request: Request): Promise<Response> {
    await connectToDatabase();
    const userPayload = await requireAuth(request);
    const user = await userRepository.findById(userPayload.userId);
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  async getHistory(request: Request): Promise<Response> {
    await connectToDatabase();
    const userPayload = await requireAuth(request);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "10");

    const history = await searchHistoryRepository.getUserHistory(userPayload.userId, page, limit);
    return new Response(JSON.stringify(history), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  async getFavorites(request: Request): Promise<Response> {
    await connectToDatabase();
    const userPayload = await requireAuth(request);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "10");

    const favorites = await favoriteRepository.getUserFavorites(userPayload.userId, page, limit);
    return new Response(JSON.stringify(favorites), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  async getReports(request: Request): Promise<Response> {
    await connectToDatabase();
    const userPayload = await requireAuth(request);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "10");

    const reports = await reportRepository.getUserReports(userPayload.userId, page, limit);
    return new Response(JSON.stringify(reports), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export class SearchController {
  async search(request: Request): Promise<Response> {
    await connectToDatabase();
    // Search can be done anonymously or authenticated
    const user = await requireAuth(request).catch(() => null);
    const body = await validateBody(request, searchSchema);

    const clientIp = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "";

    const result = await searchService.search(body.url, user?.userId, {
      ipAddress: clientIp,
      userAgent,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export class WebsiteController {
  async getWebsite(request: Request, domain: string): Promise<Response> {
    await connectToDatabase();
    const website = await websiteRepository.findByDomain(domain);
    if (!website) {
      return new Response(JSON.stringify({ error: "Website not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const latestAnalysis = await analysisRepository.findLatestForWebsite(String(website._id));

    return new Response(JSON.stringify({ website, analysis: latestAnalysis }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  async getTimeline(request: Request, domain: string): Promise<Response> {
    await connectToDatabase();
    const website = await websiteRepository.findByDomain(domain);
    if (!website) {
      return new Response(JSON.stringify([]), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const snapshots = await snapshotRepository.findByWebsiteId(String(website._id));
    const timeline = snapshots.map((s) => ({
      timestamp: s.timestamp,
      year: s.timestamp.substring(0, 4),
      screenshotUrl: s.screenshotUrl,
      technologies: s.technologies,
    }));

    return new Response(JSON.stringify(timeline), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  async getSnapshots(request: Request, domain: string): Promise<Response> {
    await connectToDatabase();
    const website = await websiteRepository.findByDomain(domain);
    if (!website) {
      return new Response(JSON.stringify([]), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const snapshots = await snapshotRepository.findByWebsiteId(String(website._id));
    return new Response(JSON.stringify(snapshots), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  async compare(request: Request): Promise<Response> {
    await connectToDatabase();
    const user = await requireAuth(request);
    const body = await validateBody(request, compareSchema);

    const website = await websiteRepository.findByDomain(body.domain);
    if (!website) {
      return new Response(JSON.stringify({ error: "Website not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    let comparison = await comparisonRepository.findComparison(
      String(website._id),
      body.yearA,
      body.yearB,
    );
    if (!comparison) {
      const result = await aiService.compareWebsites(body.domain, body.yearA, body.yearB);
      comparison = await comparisonRepository.create({
        userId: user.userId,
        websiteId: website._id,
        yearA: body.yearA,
        yearB: body.yearB,
        comparisonResult: result.comparisonResult,
        aiSummary: result.aiSummary,
      });

      // Audit & Analytics
      await auditService.log({
        userId: user.userId,
        action: "comparison",
        resource: `${body.domain}: ${body.yearA} vs ${body.yearB}`,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || "",
      });

      await analyticsService.track(
        "comparison",
        {
          domain: body.domain,
          yearA: body.yearA,
          yearB: body.yearB,
        },
        user.userId,
      );
    }

    return new Response(JSON.stringify(comparison), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  async favorite(request: Request): Promise<Response> {
    await connectToDatabase();
    const user = await requireAuth(request);
    const body = await validateBody(request, favoriteSchema);

    const website = await websiteRepository.findByDomain(body.domain);
    if (!website) {
      return new Response(JSON.stringify({ error: "Website not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const isFav = await favoriteRepository.isFavorite(user.userId, String(website._id));
    if (isFav) {
      // Unfavorite
      await favoriteRepository.deleteMany({ userId: user.userId, websiteId: website._id });
      return new Response(JSON.stringify({ favorited: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Favorite
      await favoriteRepository.create({ userId: user.userId, websiteId: website._id });

      await auditService.log({
        userId: user.userId,
        action: "favorite",
        resource: body.domain,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || "",
      });

      return new Response(JSON.stringify({ favorited: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  async generateReport(request: Request): Promise<Response> {
    await connectToDatabase();
    const user = await requireAuth(request);
    const body = await validateBody(request, reportSchema);

    const website = await websiteRepository.findByDomain(body.domain);
    if (!website) {
      return new Response(JSON.stringify({ error: "Website not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Mock PDF report generation and upload to Cloudinary
    const reportUrl = await storageService.uploadScreenshot(body.domain, `report_${Date.now()}`);

    const report = await reportRepository.create({
      userId: user.userId,
      websiteId: website._id,
      reportUrl,
      reportType: body.reportType,
    });

    await auditService.log({
      userId: user.userId,
      action: "report generation",
      resource: body.domain,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
    });

    return new Response(JSON.stringify(report), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export class AdminController {
  async getUsers(request: Request): Promise<Response> {
    await connectToDatabase();
    await requireRole(request, ["admin"]);

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "20");

    const users = await userRepository.findPaginated({}, { page, limit });
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  async getAnalytics(request: Request): Promise<Response> {
    await connectToDatabase();
    await requireRole(request, ["admin"]);

    // Aggregate key database analytics metrics
    const [totalUsers, totalSearches, totalWebsites, totalFavorites, auditLogsCount] =
      await Promise.all([
        userRepository.count(),
        searchHistoryRepository.count(),
        websiteRepository.count(),
        favoriteRepository.count(),
        auditLogRepository.count(),
      ]);

    // Aggregate trending domains (searches count grouped by domain)
    const trending = await searchHistoryRepository.find(
      {},
      { limit: 10, sort: { searchedAt: -1 } },
    );

    return new Response(
      JSON.stringify({
        metrics: {
          totalUsers,
          totalSearches,
          totalWebsites,
          totalFavorites,
          auditLogsCount,
        },
        trending: trending.map((t) => ({ domain: t.normalizedDomain, searchedAt: t.searchedAt })),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  async getSearches(request: Request): Promise<Response> {
    await connectToDatabase();
    await requireRole(request, ["admin"]);

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "20");

    const searches = await searchHistoryRepository.findPaginated(
      {},
      { page, limit, sort: { searchedAt: -1 } },
    );
    return new Response(JSON.stringify(searches), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  async getAuditLogs(request: Request): Promise<Response> {
    await connectToDatabase();
    await requireRole(request, ["admin"]);

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "20");

    const logs = await auditLogRepository.getLogs(page, limit);
    return new Response(JSON.stringify(logs), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Singletons
export const userController = new UserController();
export const searchController = new SearchController();
export const websiteController = new WebsiteController();
export const adminController = new AdminController();
