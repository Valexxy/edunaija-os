import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Server-Sent Events (SSE) endpoint for live tournament leaderboard & match score broadcast.
 * Provides real-time delta broadcasts without heavy persistent WebSocket server clusters.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const challengeId = resolvedParams.id;

  const encoder = new TextEncoder();

  // Create readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial connection payload
      const initialEvent = JSON.stringify({
        type: "CONNECTED",
        challengeId,
        timestamp: new Date().toISOString(),
        message: "Connected to sovereign tournament live delta broadcast"
      });
      controller.enqueue(encoder.encode(`event: connected\ndata: ${initialEvent}\n\n`));

      // 2. Simulated real-time score delta events
      let counter = 0;
      const interval = setInterval(() => {
        counter += 1;
        const deltaEvent = JSON.stringify({
          type: "LEADERBOARD_DELTA",
          challengeId,
          timestamp: new Date().toISOString(),
          tick: counter,
          deltas: [
            { userId: "usr-kc-lagos", name: "Chukwudi Okafor", school: "King\'s College", score: 96 + Math.min(3, counter) },
            { userId: "usr-loyola-abj", name: "Tunde Bakare", school: "Loyola Jesuit", score: 95 + Math.min(2, counter) },
            { userId: "usr-barewa-kd", name: "Fatima Aliyu", school: "Barewa College", score: 91 + Math.min(2, counter) }
          ]
        });

        try {
          controller.enqueue(encoder.encode(`event: delta\ndata: ${deltaEvent}\n\n`));
        } catch {
          clearInterval(interval);
        }

        // Stop after 5 ticks in simulated demo mode to conserve memory
        if (counter >= 5) {
          clearInterval(interval);
          controller.close();
        }
      }, 3000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive"
    }
  });
}
