"use client";

export interface OfflineAction {
  id: string;
  type: "answer_submit" | "exam_submit" | "profile_update";
  endpoint: string;
  method: "POST" | "PUT";
  payload: unknown;
  createdAt: string;
  retryCount: number;
}

const QUEUE_KEY = "edunaija_offline_sync_queue";

export function getOfflineQueue(): OfflineAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function enqueueOfflineAction(action: Omit<OfflineAction, "id" | "createdAt" | "retryCount">): OfflineAction {
  const newAction: OfflineAction = {
    ...action,
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    retryCount: 0
  };

  if (typeof window !== "undefined") {
    try {
      const queue = getOfflineQueue();
      queue.push(newAction);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      window.dispatchEvent(new CustomEvent("edunaija:queue_updated", { detail: { count: queue.length } }));
    } catch (e) {
      console.warn("Failed to enqueue offline action", e);
    }
  }

  return newAction;
}

export async function processOfflineQueue(): Promise<{ processed: number; remaining: number }> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return { processed: 0, remaining: getOfflineQueue().length };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) return { processed: 0, remaining: 0 };

  const remaining: OfflineAction[] = [];
  let processed = 0;

  for (const item of queue) {
    try {
      const res = await fetch(item.endpoint, {
        method: item.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload)
      });

      if (res.ok) {
        processed++;
      } else {
        item.retryCount++;
        if (item.retryCount < 5) remaining.push(item);
      }
    } catch {
      item.retryCount++;
      remaining.push(item);
    }
  }

  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    window.dispatchEvent(new CustomEvent("edunaija:queue_updated", { detail: { count: remaining.length } }));
  } catch {}

  return { processed, remaining: remaining.length };
}

// Local Assessment Cache Helpers
export function cacheAssessmentData(assessmentId: string, data: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`edunaija_asm_${assessmentId}`, JSON.stringify(data));
  } catch {}
}

export function getCachedAssessmentData<T>(assessmentId: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`edunaija_asm_${assessmentId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAssessmentAnswerLocally(assessmentId: string, questionId: string, answer: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = `edunaija_ans_${assessmentId}`;
    const existing = JSON.parse(localStorage.getItem(key) || "{}");
    existing[questionId] = answer;
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {}
}

export function getLocalAssessmentAnswers(assessmentId: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const key = `edunaija_ans_${assessmentId}`;
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

// Backward-compatibility class export for server and unit test suites
export class OfflineSyncQueue {
  static getQueue(): OfflineAction[] {
    return getOfflineQueue();
  }

  static async flushQueue(): Promise<{ syncedCount: number; remaining: number }> {
    const res = await processOfflineQueue();
    return { syncedCount: res.processed, remaining: res.remaining };
  }
}

