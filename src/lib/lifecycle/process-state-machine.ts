import { createHash } from "crypto";

export type ProcessType =
  | "ASSESSMENT_ATTEMPT"
  | "TOURNAMENT_DUEL"
  | "TUTOR_SESSION"
  | "AI_SOCRATIC_QUERY"
  | "OFFLINE_SYNC_JOB"
  | "DLQ_AUTO_RECOVERY";

export type ProcessState =
  // Assessment Attempt States
  | "INITIATED"
  | "IN_PROGRESS"
  | "PAUSED_OFFLINE"
  | "RESUMED"
  | "SUBMITTING"
  | "EVALUATING"
  | "COMPLETED"
  | "TIMED_OUT"
  | "ABANDONED"
  | "FLAGGED_MALPRACTICE"
  | "ARCHIVED"
  // Tournament Duel States
  | "SCHEDULED"
  | "MATCHMAKING"
  | "ROOM_PROVISIONED"
  | "ACTIVE_DUEL"
  | "SUBMISSIONS_LOCKED"
  | "TIEBREAKER"
  | "VERIFYING"
  | "LEADERBOARD_COMMITTED"
  | "REWARDS_DISPATCHED"
  | "CANCELLED"
  // Tutor Session States
  | "DISCOVERY"
  | "PROPOSAL_CREATED"
  | "PARENT_CONSENTED"
  | "ESCROW_LOCKED"
  | "ROOM_PROVISIONED"
  | "CLASS_IN_SESSION"
  | "CONCLUDED"
  | "SCORECARD_DISPATCHED"
  | "ESCROW_RELEASED"
  | "DISPUTE_QUARANTINE"
  // Socratic AI Query States
  | "INGESTED"
  | "PII_SCRUBBED"
  | "NERDC_GROUNDED"
  | "QUOTA_CHECKED"
  | "DISPATCHED_PRIMARY"
  | "FAILOVER_SECONDARY"
  | "PEDAGOGICAL_AUDITED"
  | "STREAM_DELIVERED"
  | "TOKEN_RECORDED"
  // Offline Sync States
  | "LOCAL_ENQUEUED"
  | "DELTA_COMPRESSED"
  | "NETWORK_DETECTED"
  | "HANDSHAKE_INITIATED"
  | "CONFLICT_RESOLVED"
  | "ATOMIC_COMMITTED"
  | "CLIENT_ACKNOWLEDGED"
  | "DLQ_QUARANTINED"
  // DLQ States
  | "JOB_FAILED"
  | "AI_DIAGNOSED"
  | "PAYLOAD_NORMALIZED"
  | "BACKOFF_RETRYING"
  | "RESOLVED_AUTO"
  | "ADMIN_ESCALATED";

export interface LifecycleTransitionEvent {
  fromState: ProcessState | null;
  toState: ProcessState;
  timestamp: string;
  triggeredBy: string;
  transitionLatencyMs: number;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ProcessInstance {
  id: string;
  processType: ProcessType;
  entityId: string;
  userId?: string;
  currentState: ProcessState;
  idempotencyKey: string;
  history: LifecycleTransitionEvent[];
  failureRecoveryAttempts: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Strict Monotonic Transition Graph Definitions
 */
const VALID_TRANSITIONS: Record<ProcessType, Record<string, ProcessState[]>> = {
  ASSESSMENT_ATTEMPT: {
    __INITIAL__: ["INITIATED"],
    INITIATED: ["IN_PROGRESS", "ABANDONED"],
    IN_PROGRESS: ["PAUSED_OFFLINE", "SUBMITTING", "TIMED_OUT", "FLAGGED_MALPRACTICE", "ABANDONED"],
    PAUSED_OFFLINE: ["RESUMED", "ABANDONED", "TIMED_OUT"],
    RESUMED: ["IN_PROGRESS", "SUBMITTING", "TIMED_OUT", "FLAGGED_MALPRACTICE"],
    SUBMITTING: ["EVALUATING", "IN_PROGRESS"], // IN_PROGRESS fallback if evaluation retries
    EVALUATING: ["COMPLETED", "FLAGGED_MALPRACTICE"],
    FLAGGED_MALPRACTICE: ["EVALUATING", "COMPLETED", "ARCHIVED"],
    TIMED_OUT: ["EVALUATING", "COMPLETED", "ARCHIVED"],
    COMPLETED: ["ARCHIVED"],
    ABANDONED: ["ARCHIVED"],
    ARCHIVED: [] // Terminal state
  },
  TOURNAMENT_DUEL: {
    __INITIAL__: ["SCHEDULED"],
    SCHEDULED: ["MATCHMAKING", "CANCELLED"],
    MATCHMAKING: ["ROOM_PROVISIONED", "CANCELLED"],
    ROOM_PROVISIONED: ["ACTIVE_DUEL", "CANCELLED"],
    ACTIVE_DUEL: ["SUBMISSIONS_LOCKED", "CANCELLED"],
    SUBMISSIONS_LOCKED: ["TIEBREAKER", "VERIFYING"],
    TIEBREAKER: ["VERIFYING"],
    VERIFYING: ["LEADERBOARD_COMMITTED"],
    LEADERBOARD_COMMITTED: ["REWARDS_DISPATCHED"],
    REWARDS_DISPATCHED: [], // Terminal state
    CANCELLED: [] // Terminal state
  },
  TUTOR_SESSION: {
    __INITIAL__: ["DISCOVERY"],
    DISCOVERY: ["PROPOSAL_CREATED"],
    PROPOSAL_CREATED: ["PARENT_CONSENTED", "DISPUTE_QUARANTINE"],
    PARENT_CONSENTED: ["ESCROW_LOCKED", "DISPUTE_QUARANTINE"],
    ESCROW_LOCKED: ["ROOM_PROVISIONED", "DISPUTE_QUARANTINE"],
    ROOM_PROVISIONED: ["CLASS_IN_SESSION", "DISPUTE_QUARANTINE"],
    CLASS_IN_SESSION: ["CONCLUDED", "DISPUTE_QUARANTINE"],
    CONCLUDED: ["SCORECARD_DISPATCHED"],
    SCORECARD_DISPATCHED: ["ESCROW_RELEASED"],
    ESCROW_RELEASED: [], // Terminal state
    DISPUTE_QUARANTINE: ["ESCROW_RELEASED"] // Settled
  },
  AI_SOCRATIC_QUERY: {
    __INITIAL__: ["INGESTED"],
    INGESTED: ["PII_SCRUBBED"],
    PII_SCRUBBED: ["NERDC_GROUNDED"],
    NERDC_GROUNDED: ["QUOTA_CHECKED"],
    QUOTA_CHECKED: ["DISPATCHED_PRIMARY", "FAILOVER_SECONDARY"],
    DISPATCHED_PRIMARY: ["PEDAGOGICAL_AUDITED", "FAILOVER_SECONDARY"],
    FAILOVER_SECONDARY: ["PEDAGOGICAL_AUDITED"],
    PEDAGOGICAL_AUDITED: ["STREAM_DELIVERED"],
    STREAM_DELIVERED: ["TOKEN_RECORDED"],
    TOKEN_RECORDED: [] // Terminal state
  },
  OFFLINE_SYNC_JOB: {
    __INITIAL__: ["LOCAL_ENQUEUED"],
    LOCAL_ENQUEUED: ["DELTA_COMPRESSED"],
    DELTA_COMPRESSED: ["NETWORK_DETECTED"],
    NETWORK_DETECTED: ["HANDSHAKE_INITIATED"],
    HANDSHAKE_INITIATED: ["CONFLICT_RESOLVED", "DLQ_QUARANTINED"],
    CONFLICT_RESOLVED: ["ATOMIC_COMMITTED"],
    ATOMIC_COMMITTED: ["CLIENT_ACKNOWLEDGED"],
    CLIENT_ACKNOWLEDGED: [], // Terminal state
    DLQ_QUARANTINED: ["HANDSHAKE_INITIATED"] // Retry
  },
  DLQ_AUTO_RECOVERY: {
    __INITIAL__: ["JOB_FAILED"],
    JOB_FAILED: ["AI_DIAGNOSED"],
    AI_DIAGNOSED: ["PAYLOAD_NORMALIZED", "ADMIN_ESCALATED"],
    PAYLOAD_NORMALIZED: ["BACKOFF_RETRYING"],
    BACKOFF_RETRYING: ["RESOLVED_AUTO", "JOB_FAILED", "ADMIN_ESCALATED"],
    RESOLVED_AUTO: [], // Terminal state
    ADMIN_ESCALATED: [] // Terminal state
  }
};

/**
 * Universal In-Memory Process Lifecycle Store
 * Built for 1,000,000 activities with high-throughput circular pruning
 */
export class ProcessStateMachine {
  private static instances = new Map<string, ProcessInstance>();
  private static idempotencyMap = new Map<string, string>(); // idempotencyKey -> instanceId
  private static MAX_IN_MEMORY_INSTANCES = 100_000;

  /**
   * Generates a deterministic SHA-256 checksum for a state transition
   */
  private static computeTransitionChecksum(
    instanceId: string,
    fromState: ProcessState | null,
    toState: ProcessState,
    timestamp: string
  ): string {
    return createHash("sha256")
      .update(`${instanceId}:${fromState || "START"}->${toState}@${timestamp}`)
      .digest("hex");
  }

  /**
   * Initializes a new process lifecycle instance with strict idempotency verification
   */
  static startProcess(params: {
    processType: ProcessType;
    entityId: string;
    userId?: string;
    idempotencyKey: string;
    initialState: ProcessState;
    triggeredBy?: string;
    metadata?: Record<string, unknown>;
  }): ProcessInstance {
    // 1. Idempotency Check: return existing instance if duplicate key received
    const existingId = this.idempotencyMap.get(params.idempotencyKey);
    if (existingId) {
      const existing = this.instances.get(existingId);
      if (existing) {
        return existing;
      }
    }

    // 2. Validate initial state
    const validInitials = VALID_TRANSITIONS[params.processType].__INITIAL__;
    if (!validInitials.includes(params.initialState)) {
      throw new Error(
        `Invalid initial state "${params.initialState}" for process ${params.processType}. Allowed: ${validInitials.join(", ")}`
      );
    }

    const now = new Date().toISOString();
    const id = `proc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const initialChecksum = this.computeTransitionChecksum(id, null, params.initialState, now);

    const initialTransition: LifecycleTransitionEvent = {
      fromState: null,
      toState: params.initialState,
      timestamp: now,
      triggeredBy: params.triggeredBy || "system",
      transitionLatencyMs: 0,
      metadata: params.metadata,
      checksum: initialChecksum
    };

    const instance: ProcessInstance = {
      id,
      processType: params.processType,
      entityId: params.entityId,
      userId: params.userId,
      currentState: params.initialState,
      idempotencyKey: params.idempotencyKey,
      history: [initialTransition],
      failureRecoveryAttempts: 0,
      metadata: params.metadata || {},
      createdAt: now,
      updatedAt: now
    };

    // Circular capacity enforcement to maintain light memory footprint
    if (this.instances.size >= this.MAX_IN_MEMORY_INSTANCES) {
      const oldestKey = this.instances.keys().next().value;
      if (oldestKey) {
        const oldInst = this.instances.get(oldestKey);
        if (oldInst) {
          this.idempotencyMap.delete(oldInst.idempotencyKey);
        }
        this.instances.delete(oldestKey);
      }
    }

    this.instances.set(id, instance);
    this.idempotencyMap.set(params.idempotencyKey, id);

    return instance;
  }

  /**
   * Executes a verified transition from current state to target state
   */
  static transition(params: {
    instanceId: string;
    toState: ProcessState;
    triggeredBy?: string;
    metadata?: Record<string, unknown>;
  }): ProcessInstance {
    const instance = this.instances.get(params.instanceId);
    if (!instance) {
      throw new Error(`Process instance ${params.instanceId} not found`);
    }

    const currentState = instance.currentState;
    const allowedTransitions = VALID_TRANSITIONS[instance.processType][currentState] || [];

    if (!allowedTransitions.includes(params.toState)) {
      throw new Error(
        `Illegal transition in ${instance.processType} for ${instance.id}: Cannot transition from "${currentState}" to "${params.toState}". Valid transitions: [${allowedTransitions.join(", ")}]`
      );
    }

    const now = new Date().toISOString();
    const lastTimestamp = new Date(instance.updatedAt).getTime();
    const transitionLatencyMs = Math.max(0, Date.now() - lastTimestamp);

    const checksum = this.computeTransitionChecksum(instance.id, currentState, params.toState, now);

    const transitionEvent: LifecycleTransitionEvent = {
      fromState: currentState,
      toState: params.toState,
      timestamp: now,
      triggeredBy: params.triggeredBy || "system",
      transitionLatencyMs,
      metadata: params.metadata,
      checksum
    };

    instance.currentState = params.toState;
    instance.history.push(transitionEvent);
    instance.updatedAt = now;
    if (params.metadata) {
      instance.metadata = { ...instance.metadata, ...params.metadata };
    }

    return instance;
  }

  /**
   * Retrieve instance by ID
   */
  static getInstance(id: string): ProcessInstance | null {
    return this.instances.get(id) || null;
  }

  /**
   * Retrieve instance by Idempotency Key
   */
  static getByIdempotencyKey(key: string): ProcessInstance | null {
    const id = this.idempotencyMap.get(key);
    return id ? this.instances.get(id) || null : null;
  }

  /**
   * Count active processes
   */
  static getMetrics(): {
    totalActive: number;
    byProcessType: Record<ProcessType, number>;
  } {
    const byProcessType: Record<ProcessType, number> = {
      ASSESSMENT_ATTEMPT: 0,
      TOURNAMENT_DUEL: 0,
      TUTOR_SESSION: 0,
      AI_SOCRATIC_QUERY: 0,
      OFFLINE_SYNC_JOB: 0,
      DLQ_AUTO_RECOVERY: 0
    };

    for (const inst of this.instances.values()) {
      byProcessType[inst.processType] = (byProcessType[inst.processType] || 0) + 1;
    }

    return {
      totalActive: this.instances.size,
      byProcessType
    };
  }

  /**
   * Reset store (Used in testing)
   */
  static reset(): void {
    this.instances.clear();
    this.idempotencyMap.clear();
  }
}
