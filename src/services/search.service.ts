import mongoose from "mongoose";
import {
  websiteRepository,
  snapshotRepository,
  searchHistoryRepository,
  analysisRepository,
} from "../repositories";
import { aiService } from "./ai.service";
import { storageService } from "./storage.service";
import { auditService } from "./audit.service";
import { analyticsService } from "./analytics.service";
import { normalizeUrl } from "../lib/wayback";

import { ISnapshot } from "../models/snapshot.model";

export class SearchService {
  async search(
    targetUrl: string,
    userId?: string,
    meta: { ipAddress?: string; userAgent?: string } = {},
  ): Promise<unknown> {
    const startTime = Date.now();
    const domain = normalizeUrl(targetUrl);

    // 1. Check database cache first
    let website = await websiteRepository.findByDomain(domain);
    let isCached = false;

    // Cache hit: If website was updated less than 24 hours ago, use cache
    if (website && Date.now() - new Date(website.updatedAt).getTime() < 24 * 60 * 60 * 1000) {
      isCached = true;
    }

    let snapshots: ISnapshot[] = [];
    let isSynthetic = false;

    if (isCached && website) {
      snapshots = await snapshotRepository.findByWebsiteId(String(website._id));
    } else {
      // 2. Fetch from Wayback API
      const api = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(
        domain,
      )}&output=json&from=1996&to=2025&collapse=timestamp:4&limit=80&filter=statuscode:200&fl=timestamp,original,statuscode`;

      let dataRows: string[][] | null = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

        const res = await fetch(api, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          dataRows = await res.json();
        }
      } catch (err) {
        console.error("Wayback CDX API fetch failed during search service:", err);
      }

      if (!dataRows || dataRows.length <= 1) {
        // Fallback: Generate synthetic timeline
        const startYear = domain.includes("apple.com") ? 1996 : 1998;
        const endYear = new Date().getFullYear();
        dataRows = [["timestamp", "original", "statuscode"]];
        for (let year = startYear; year <= endYear; year++) {
          dataRows.push([`${year}1015120000`, `http://${domain}/`, "200"]);
        }
        isSynthetic = true;
      }

      // Format snapshots
      const rawSnaps = dataRows.slice(1).map((row) => ({
        timestamp: row[0],
        archiveUrl: `https://web.archive.org/web/${row[0]}/${row[1]}`,
      }));

      // 3. Save to database using Mongoose Session Transaction
      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        // Create or update website
        const firstSnapYear = rawSnaps[0]?.timestamp.substring(0, 4) || "1998";
        const latestSnapYear =
          rawSnaps[rawSnaps.length - 1]?.timestamp.substring(0, 4) ||
          String(new Date().getFullYear());

        if (!website) {
          website = await websiteRepository.create({
            domain,
            title: domain.split(".")[0].toUpperCase(),
            description: `Historical archives of ${domain}`,
            favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
            firstSnapshot: firstSnapYear,
            latestSnapshot: latestSnapYear,
            totalSnapshots: rawSnaps.length,
          });
        } else {
          website.totalSnapshots = rawSnaps.length;
          website.firstSnapshot = firstSnapYear;
          website.latestSnapshot = latestSnapYear;
          await website.save({ session });
        }

        // Batch save snapshots
        const snapshotOperations = rawSnaps.map((s) => {
          const year = s.timestamp.substring(0, 4);
          return {
            updateOne: {
              filter: { websiteId: website!._id, timestamp: s.timestamp },
              update: {
                $setOnInsert: {
                  websiteId: website!._id,
                  timestamp: s.timestamp,
                  archiveUrl: s.archiveUrl,
                  screenshotUrl: `https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop`, // Placeholder
                  metadata: { year, capturedAt: new Date() },
                  technologies: ["HTML", "CSS", "JavaScript"],
                },
              },
              upsert: true,
            },
          };
        });

        await mongoose.model("Snapshot").bulkWrite(snapshotOperations, { session });

        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        console.error("Database search transaction aborted:", err);
        // Fallback: execute without transaction if server doesn't support replica sets
        if (!website) {
          website = await websiteRepository.create({
            domain,
            title: domain.split(".")[0].toUpperCase(),
            description: `Historical archives of ${domain}`,
            favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
            firstSnapshot: rawSnaps[0]?.timestamp.substring(0, 4),
            latestSnapshot: rawSnaps[rawSnaps.length - 1]?.timestamp.substring(0, 4),
            totalSnapshots: rawSnaps.length,
          });
        }
      } finally {
        session.endSession();
      }

      // Fetch newly saved snapshots
      snapshots = await snapshotRepository.findByWebsiteId(String(website!._id));
    }

    // 4. Generate AI Insight for the latest year if not exists
    const latestYear = Number(website!.latestSnapshot || new Date().getFullYear());
    let latestAnalysis = await analysisRepository.findLatestForWebsite(String(website!._id));

    if (!latestAnalysis) {
      const aiResult = await aiService.analyzeWebsite(domain, latestYear);
      latestAnalysis = await analysisRepository.create({
        userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        websiteId: website!._id,
        aiSummary: aiResult.aiSummary,
        designEvolution: aiResult.designEvolution,
        redesignPeriods: aiResult.redesignPeriods,
        modernizationScore: aiResult.modernizationScore,
        nostalgiaScore: aiResult.nostalgiaScore,
      });
    }

    const duration = Date.now() - startTime;

    // 5. Track Search History
    await searchHistoryRepository.create({
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      searchTerm: domain,
      normalizedDomain: domain,
      totalSnapshots: snapshots.length,
      source: isCached ? "cache" : isSynthetic ? "synthetic" : "wayback",
      status: "success",
    });

    // 6. Asynchronous Auditing and Analytics
    await auditService.log({
      userId,
      action: "search",
      resource: domain,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    await analyticsService.track(
      "search",
      {
        domain,
        snapshotsCount: snapshots.length,
        durationMs: duration,
        isCached,
        isSynthetic,
      },
      userId,
    );

    return {
      website,
      snapshots,
      analysis: latestAnalysis,
      isCached,
      isSynthetic,
      performance: {
        durationMs: duration,
      },
    };
  }
}

export const searchService = new SearchService();
