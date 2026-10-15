import { NextResponse } from "next/server";
import { AiSentinelWatchdog, ImmutableAuditLedger } from "@/lib/monitoring/ai-sentinel";
import { ProcessStateMachine } from "@/lib/lifecycle/process-state-machine";
import { withEnterpriseErrorHandler } from "@/lib/monitoring/enterprise-error-handler";

export const runtime = "nodejs";

/**
 * GET /api/monitoring/sentinel
 * Real-time 24/7 AI Sentinel Diagnostic Pulse, FSM Process Metrics, and Cryptographic Ledger Chain Status
 */
export const GET = withEnterpriseErrorHandler(async () => {
  const sentinelPulse = AiSentinelWatchdog.runAutonomousPulse();
  const processMetrics = ProcessStateMachine.getMetrics();
  const ledgerIntegrity = ImmutableAuditLedger.verifyChainIntegrity();

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    sentinel: sentinelPulse,
    processes: processMetrics,
    ledger: {
      totalRecords: ImmutableAuditLedger.getRecordCount(),
      chainIntegrityValid: ledgerIntegrity.valid,
      latestRecords: ImmutableAuditLedger.getLatestRecords(5)
    }
  });
}, "GET /api/monitoring/sentinel");

/**
 * POST /api/monitoring/sentinel
 * Administrative control endpoint to reset circuit breakers or simulate test anomalies
 */
export const POST = withEnterpriseErrorHandler(async (req: Request) => {
  const body = await req.json().catch(() => ({}));
  const action = body.action;

  if (action === "reset_circuit_breakers") {
    AiSentinelWatchdog.reset();
    return NextResponse.json({ success: true, message: "Circuit breakers and providers reset to default GEMINI closed state" });
  }

  if (action === "force_failover") {
    const target = body.targetProvider || "GROQ";
    AiSentinelWatchdog.setActiveProvider(target);
    return NextResponse.json({ success: true, message: `Active LLM provider forced to ${target}` });
  }

  return NextResponse.json({ error: "Unsupported action. Valid actions: reset_circuit_breakers, force_failover" }, { status: 400 });
}, "POST /api/monitoring/sentinel");
