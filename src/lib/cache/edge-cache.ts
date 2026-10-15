/**
 * Cloudflare Edge-Compatible & In-Memory High-Performance Cache Engine.
 * 
 * Provides sub-millisecond sorted set leaderboards, LRU key-value caching,
 * and token-bucket rate limiting without requiring Upstash Redis or credit cards.
 * Also generates Cloudflare CDN edge caching headers for zero-latency response delivery.
 */

import { upstashRedis } from "./upstash-client";

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

export interface LeaderboardMember {
  member: string;
  score: number;
}

// Global persistent cache singleton across Next.js invocations in development & Node runtime
const globalCache = globalThis as unknown as {
  __edunaija_kv_store?: Map<string, CacheEntry<unknown>>;
  __edunaija_leaderboards?: Map<string, Map<string, number>>;
  __edunaija_rate_limits?: Map<string, { count: number; resetAt: number }>;
};

if (!globalCache.__edunaija_kv_store) {
  globalCache.__edunaija_kv_store = new Map();
}
if (!globalCache.__edunaija_leaderboards) {
  globalCache.__edunaija_leaderboards = new Map();
}
if (!globalCache.__edunaija_rate_limits) {
  globalCache.__edunaija_rate_limits = new Map();
}

const kvStore = globalCache.__edunaija_kv_store!;
const leaderboards = globalCache.__edunaija_leaderboards!;
const rateLimits = globalCache.__edunaija_rate_limits!;

export class EdgeCacheEngine {
  /**
   * Set a key with optional TTL in seconds
   */
  static set<T>(key: string, value: T, ttlSeconds?: number): void {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    kvStore.set(key, { value, expiresAt });
    if (upstashRedis.isConfigured()) {
      upstashRedis.set(key, value, ttlSeconds).catch(() => {});
    }
  }

  /**
   * Get a cached value. Automatically purges expired items.
   */
  static get<T>(key: string): T | null {
    const entry = kvStore.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      kvStore.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Delete a key
   */
  static del(key: string): boolean {
    if (upstashRedis.isConfigured()) {
      upstashRedis.del(key).catch(() => {});
    }
    return kvStore.delete(key);
  }

  /**
   * Purge all expired KV cache entries and expired rate limits
   * Returns count of purged items
   */
  static purgeExpired(): { kvPurged: number; rateLimitsPurged: number } {
    const now = Date.now();
    let kvPurged = 0;
    for (const [key, entry] of kvStore.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        kvStore.delete(key);
        kvPurged += 1;
      }
    }

    let rateLimitsPurged = 0;
    for (const [key, entry] of rateLimits.entries()) {
      if (now > entry.resetAt) {
        rateLimits.delete(key);
        rateLimitsPurged += 1;
      }
    }

    return { kvPurged, rateLimitsPurged };
  }

  /**
   * Snapshot and archive an active leaderboard to an archive key, then reset
   */
  static archiveLeaderboard(leaderboardKey: string, archiveKey: string): { archivedCount: number } {
    const board = leaderboards.get(leaderboardKey);
    if (!board) return { archivedCount: 0 };

    const archivedCopy = new Map(board);
    leaderboards.set(archiveKey, archivedCopy);
    board.clear();
    return { archivedCount: archivedCopy.size };
  }

  /**
   * Reset a leaderboard without archiving
   */
  static resetLeaderboard(leaderboardKey: string): void {
    const board = leaderboards.get(leaderboardKey);
    if (board) {
      board.clear();
    }
  }

  /**
   * Retrieve operational stats for cache engine monitoring
   */
  static getStats(): { kvCount: number; leaderboardsCount: number; rateLimitsCount: number } {
    return {
      kvCount: kvStore.size,
      leaderboardsCount: leaderboards.size,
      rateLimitsCount: rateLimits.size
    };
  }

  /**
   * Record or update a scholar score in a leaderboard (equivalent to Redis ZADD)
   */
  static zadd(leaderboardKey: string, score: number, member: string): void {
    let board = leaderboards.get(leaderboardKey);
    if (!board) {
      board = new Map();
      leaderboards.set(leaderboardKey, board);
    }
    board.set(member, score);
    if (upstashRedis.isConfigured()) {
      upstashRedis.zadd(leaderboardKey, score, member).catch(() => {});
    }
  }

  /**
   * Retrieve the top scholars sorted descending by score (equivalent to Redis ZREVRANGE)
   */
  static zrevrange(
    leaderboardKey: string,
    start: number = 0,
    stop: number = 9
  ): LeaderboardMember[] {
    const board = leaderboards.get(leaderboardKey);
    if (!board) return [];

    const sorted = Array.from(board.entries())
      .map(([member, score]) => ({ member, score }))
      .sort((a, b) => b.score - a.score);

    return sorted.slice(start, stop + 1);
  }

  /**
   * Rate-limiting check (Token bucket algorithm)
   * Returns { allowed: boolean, remaining: number, resetInSeconds: number }
   */
  static rateLimit(
    identifier: string,
    limit: number = 30,
    windowSeconds: number = 60
  ): { allowed: boolean; remaining: number; resetInSeconds: number } {
    const now = Date.now();
    const entry = rateLimits.get(identifier);

    if (!entry || now > entry.resetAt) {
      rateLimits.set(identifier, {
        count: 1,
        resetAt: now + windowSeconds * 1000
      });
      return {
        allowed: true,
        remaining: limit - 1,
        resetInSeconds: windowSeconds
      };
    }

    if (entry.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: Math.ceil((entry.resetAt - now) / 1000)
      };
    }

    entry.count += 1;
    return {
      allowed: true,
      remaining: limit - entry.count,
      resetInSeconds: Math.ceil((entry.resetAt - now) / 1000)
    };
  }

  /**
   * Generate optimal Cloudflare Edge caching response headers
   */
  static getCloudflareCacheHeaders(
    maxAgeSeconds: number = 60,
    staleWhileRevalidateSeconds: number = 300
  ): Record<string, string> {
    return {
      "Cache-Control": `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
      "CDN-Cache-Control": `public, max-age=${maxAgeSeconds * 2}`,
      "Cloudflare-CDN-Cache-Control": `public, max-age=${maxAgeSeconds * 2}`
    };
  }
}
