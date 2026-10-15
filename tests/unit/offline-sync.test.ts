import { describe, it, expect } from "vitest";
import { OfflineSyncQueue } from "@/lib/offline/sync-queue";

describe("Offline CBT Synchronizer", () => {
  it("should handle SSR / server execution without errors", async () => {
    const queue = OfflineSyncQueue.getQueue();
    expect(queue).toEqual([]);

    const result = await OfflineSyncQueue.flushQueue();
    expect(result.syncedCount).toBe(0);
  });
});
