import 'server-only';

import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { liveKitClientUrl, liveKitHttpUrl } from '@/lib/livekit-url';

export type LiveKitConfig = {
  url: string;
  apiKey: string;
  apiSecret: string;
};

export { liveKitClientUrl, liveKitHttpUrl };

export function getLiveKitConfig(): LiveKitConfig | null {
  const url = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!url || !apiKey || !apiSecret) return null;
  return { url, apiKey, apiSecret };
}

function roomClient(config: LiveKitConfig) {
  return new RoomServiceClient(liveKitHttpUrl(config.url), config.apiKey, config.apiSecret);
}

export async function ensureLiveKitRoom(room: string) {
  const config = getLiveKitConfig();
  if (!config) throw new Error('livekit_not_configured');
  const client = roomClient(config);
  try {
    await client.createRoom({
      name: room,
      emptyTimeout: 60 * 10,
      departureTimeout: 20,
      maxParticipants: 4,
    });
  } catch (error) {
    const existing = await client.listRooms([room]).catch(() => []);
    if (!existing.length) throw error;
  }
}

export async function createLiveKitToken(
  room: string,
  user: { uid: string; displayName: string | null; email: string | null },
) {
  const config = getLiveKitConfig();
  if (!config) throw new Error('livekit_not_configured');
  await ensureLiveKitRoom(room);
  const token = new AccessToken(config.apiKey, config.apiSecret, {
    identity: user.uid,
    name: user.displayName || user.email || 'Skill Swap user',
    ttl: '1h',
    metadata: JSON.stringify({ uid: user.uid }),
  });
  token.addGrant({
    roomJoin: true,
    roomCreate: true,
    room,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true,
  });
  return { token: await token.toJwt(), serverUrl: liveKitClientUrl(config.url) };
}
