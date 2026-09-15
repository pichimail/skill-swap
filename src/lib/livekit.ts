import 'server-only';

import { AccessToken } from 'livekit-server-sdk';

export function getLiveKitConfig() {
  const url = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!url || !apiKey || !apiSecret) return null;
  return { url, apiKey, apiSecret };
}

export async function createLiveKitToken(room: string, user: { uid: string; displayName: string | null; email: string | null }) {
  const config = getLiveKitConfig();
  if (!config) throw new Error('livekit_not_configured');
  const token = new AccessToken(config.apiKey, config.apiSecret, {
    identity: user.uid,
    name: user.displayName || user.email || 'Skill Swap user',
    ttl: '1h',
  });
  token.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true, canPublishData: true });
  return { token: await token.toJwt(), serverUrl: config.url };
}
