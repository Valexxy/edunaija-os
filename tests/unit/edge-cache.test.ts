import { describe, it, expect, beforeEach } from "vitest";
import { EdgeCacheEngine } from "@/lib/cache/edge-cache";

describe("EdgeCacheEngine (Redis Alternative)", () => {
  beforeEach(() => {
    EdgeCacheEngine.del("test_key");
  });

  it("should store and retrieve key-values correctly", () => {
    EdgeCacheEngine.set("test_key", { exam: "JAMB", year: 2026 });
    const val = EdgeCacheEngine.get<{ exam: string; year: number }>("test_key");
    expect(val).toEqual({ exam: "JAMB", year: 2026 });
  });

  it("should maintain sorted leaderboards with zadd and zrevrange", () => {
    const boardKey = "state_tournament_anambra";
    EdgeCacheEngine.zadd(boardKey, 95, "Chukwudi");
    EdgeCacheEngine.zadd(boardKey, 98, "Amina");
    EdgeCacheEngine.zadd(boardKey, 88, "Babajide");

    const top = EdgeCacheEngine.zrevrange(boardKey, 0, 2);
    expect(top).toHaveLength(3);
    expect(top[0].member).toBe("Amina");
    expect(top[0].score).toBe(98);
    expect(top[1].member).toBe("Chukwudi");
    expect(top[2].member).toBe("Babajide");
  });

  it("should enforce rate limiting correctly", () => {
    const ip = "192.168.1.100";
    const res1 = EdgeCacheEngine.rateLimit(ip, 2, 60);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = EdgeCacheEngine.rateLimit(ip, 2, 60);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(0);

    const res3 = EdgeCacheEngine.rateLimit(ip, 2, 60);
    expect(res3.allowed).toBe(false);
  });
});
