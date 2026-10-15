import { getUpstashEnv } from "@/lib/env";

/**
 * High-Throughput Upstash Serverless Redis REST Client
 * Zero-dependency native fetch implementation.
 * Provides multi-region distributed caching, global rate limiting,
 * and serverless Sorted Set leaderboards (ZADD, ZREVRANGE).
 */
export class UpstashRedisClient {
  private url: string;
  private token: string;
  private configured: boolean;

  constructor() {
    const env = getUpstashEnv();
    this.url = env.url;
    this.token = env.token;
    this.configured = env.isConfigured;
  }

  public isConfigured(): boolean {
    return this.configured && Boolean(this.url && this.token);
  }

  public async execute<T = unknown>(command: (string | number)[]): Promise<T | null> {
    if (!this.isConfigured()) return null;
    try {
      const res = await fetch(this.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.result as T;
    } catch {
      return null;
    }
  }

  public async zadd(key: string, score: number, member: string): Promise<number | null> {
    return this.execute<number>(["ZADD", key, score, member]);
  }

  public async zrevrange(key: string, start: number = 0, stop: number = 9): Promise<string[] | null> {
    return this.execute<string[]>(["ZREVRANGE", key, start, stop]);
  }

  public async set(key: string, value: unknown, ttlSeconds?: number): Promise<string | null> {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      return this.execute<string>(["SET", key, serialized, "EX", ttlSeconds]);
    }
    return this.execute<string>(["SET", key, serialized]);
  }

  public async get<T = unknown>(key: string): Promise<T | null> {
    const raw = await this.execute<string>(["GET", key]);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  public async del(key: string): Promise<number | null> {
    return this.execute<number>(["DEL", key]);
  }

  public async ping(): Promise<boolean> {
    const res = await this.execute<string>(["PING"]);
    return res === "PONG";
  }
}

export const upstashRedis = new UpstashRedisClient();
