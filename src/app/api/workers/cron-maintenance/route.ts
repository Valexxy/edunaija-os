import { NextRequest, NextResponse } from "next/server";
import { MaintenancePipeline } from "@/lib/workers/maintenance-pipeline";
import { AutonomousScheduler } from "@/lib/workers/autonomous-scheduler";
import { EdgeCacheEngine } from "@/lib/cache/edge-cache";

export const runtime = "nodejs";

/**
 * Automated Cron & Maintenance Worker Endpoint.
 * 
 * Can be triggered via:
 * 1. Cloudflare Cron Triggers / QStash / Vercel Cron
 * 2. GitHub Actions Scheduled Workflow
 * 3. Manual Administrator / Automated Script Ping
 */
export async function GET(request: NextRequest) {
  return handleMaintenance(request);
}

export async function POST(request: NextRequest) {
  return handleMaintenance(request);
}

async function handleMaintenance(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const cronSecretHeader = request.headers.get("x-cron-secret") || "";
  const expectedSecret = process.env.CRON_SECRET;

  // In production, if CRON_SECRET is set, require either Bearer token or x-cron-secret
  if (expectedSecret && expectedSecret.trim() !== "") {
    const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (bearer !== expectedSecret && cronSecretHeader !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized worker invocation: invalid cron secret." },
        { status: 401 }
      );
    }
  }

  const triggeredBy = request.headers.get("x-triggered-by") || "http_cron_ping";
  const report = MaintenancePipeline.runAll(triggeredBy);

  // Return comprehensive status with Cloudflare cache prevention headers (always fresh)
  return NextResponse.json(
    {
      status: "success",
      message: "Automated maintenance pipeline executed successfully.",
      report,
      cachedReport: EdgeCacheEngine.get("system:worker:last_run") ? true : false,
      lastAutonomousReportId: AutonomousScheduler.getLastReport()?.executionId || null,
      schedulerRunning: true
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    }
  );
}
