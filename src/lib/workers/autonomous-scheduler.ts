/**
 * In-process Autonomous Background Worker Scheduler.
 * 
 * Runs automatically within the server process without requiring paid external cron services.
 * Periodically executes the MaintenancePipeline to maintain spaced repetition,
 * leaderboards, and cache hygiene.
 */

import { MaintenancePipeline, FullMaintenanceRunReport } from "./maintenance-pipeline";
import { AiSentinelWatchdog, AiSentinelAuditReport } from "@/lib/monitoring/ai-sentinel";

interface GlobalSchedulerStore {
  __edunaija_scheduler_timer?: NodeJS.Timeout | null;
  __edunaija_last_auto_report?: FullMaintenanceRunReport | null;
  __edunaija_last_sentinel_report?: AiSentinelAuditReport | null;
}

const g = globalThis as unknown as GlobalSchedulerStore;

export class AutonomousScheduler {
  private static intervalMs = 60 * 60 * 1000; // 1 hour default

  static start(intervalMs: number = 60 * 60 * 1000): void {
    if (g.__edunaija_scheduler_timer) {
      return; // Already initialized
    }

    this.intervalMs = intervalMs;

    // Run immediately once on startup to warm up caches, audit Q&A, and run AI Sentinel diagnostic pulse
    try {
      const initialReport = MaintenancePipeline.runAll("server_startup_worker");
      g.__edunaija_last_auto_report = initialReport;
      
      const initialSentinelPulse = AiSentinelWatchdog.runAutonomousPulse();
      g.__edunaija_last_sentinel_report = initialSentinelPulse;

      console.log(`[AutonomousScheduler] Startup maintenance completed (Audit: ${initialReport.pipelines.qaAccuracy.accuracyPercentage}%, Duration: ${initialReport.durationMs}ms, Sentinel Health: ${initialSentinelPulse.healthScore}%)`);
    } catch (err) {
      console.error("[AutonomousScheduler] Startup run error:", err);
    }

    // Schedule periodic recurring background runs
    g.__edunaija_scheduler_timer = setInterval(() => {
      try {
        const report = MaintenancePipeline.runAll("in_process_autonomous_worker");
        g.__edunaija_last_auto_report = report;

        const sentinelPulse = AiSentinelWatchdog.runAutonomousPulse();
        g.__edunaija_last_sentinel_report = sentinelPulse;

        console.log(`[AutonomousScheduler] Hourly background maintenance & Sentinel pulse executed (${report.executionId}, Health: ${sentinelPulse.healthScore}%)`);
      } catch (err) {
        console.error("[AutonomousScheduler] Periodic run error:", err);
      }
    }, this.intervalMs);

    // Allow Node to exit cleanly without waiting for this background timer
    if (g.__edunaija_scheduler_timer && typeof g.__edunaija_scheduler_timer.unref === "function") {
      g.__edunaija_scheduler_timer.unref();
    }
  }

  static stop(): void {
    if (g.__edunaija_scheduler_timer) {
      clearInterval(g.__edunaija_scheduler_timer);
      g.__edunaija_scheduler_timer = null;
    }
  }

  static getLastReport(): FullMaintenanceRunReport | null {
    return g.__edunaija_last_auto_report || null;
  }

  static getLastSentinelPulse(): AiSentinelAuditReport | null {
    return g.__edunaija_last_sentinel_report || null;
  }
}

// Auto-start scheduler on module evaluation in server runtime
if (typeof window === "undefined") {
  AutonomousScheduler.start();
}
