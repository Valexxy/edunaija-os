import { AccessToken } from "livekit-server-sdk";
import { getLiveKitEnv } from "@/lib/env";

export interface LiveRoomTokenRequest {
  roomName: string;
  participantIdentity: string;
  participantName: string;
  isTeacher?: boolean;
}

/**
 * Creates a signed JWT access token for LiveKit Cloud WebRTC virtual classroom.
 * Allows audio/video publishing, collaborative whiteboard sync, and chat.
 */
export async function createLiveKitToken({
  roomName,
  participantIdentity,
  participantName,
  isTeacher = false
}: LiveRoomTokenRequest): Promise<string> {
  const { apiKey, apiSecret, isConfigured } = getLiveKitEnv();
  if (!isConfigured) {
    throw new Error("LiveKit credentials are not configured in environment variables.");
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    name: participantName,
    ttl: "4h"
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: isTeacher,
    roomRecord: isTeacher
  });

  return await at.toJwt();
}
