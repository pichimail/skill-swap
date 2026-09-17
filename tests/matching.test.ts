import { describe, expect, it } from 'vitest';
import { liveKitRoomName, matchScoreFromCompatibility } from '@/lib/matching';
import { liveKitClientUrl, liveKitHttpUrl } from '@/lib/livekit-url';

describe('matchScoreFromCompatibility', () => {
  it('returns 0 when there is no overlap', () => {
    expect(matchScoreFromCompatibility(0)).toBe(0);
    expect(matchScoreFromCompatibility(-1)).toBe(0);
  });

  it('scales reciprocal skill overlap and caps at 100', () => {
    expect(matchScoreFromCompatibility(1)).toBe(50);
    expect(matchScoreFromCompatibility(2)).toBe(100);
    expect(matchScoreFromCompatibility(4)).toBe(100);
  });
});

describe('liveKitRoomName', () => {
  it('namespaces rooms to the session id', () => {
    expect(liveKitRoomName('9f1c0a2e-1111-2222-3333-444444444444')).toBe('skillswap-9f1c0a2e-1111-2222-3333-444444444444');
  });
});

describe('liveKit urls', () => {
  it('converts websocket origins to https for RoomService', () => {
    expect(liveKitHttpUrl('wss://ravi-uaxfnmcu.livekit.cloud')).toBe('https://ravi-uaxfnmcu.livekit.cloud');
  });

  it('keeps client websocket urls and upgrades https', () => {
    expect(liveKitClientUrl('wss://ravi-uaxfnmcu.livekit.cloud')).toBe('wss://ravi-uaxfnmcu.livekit.cloud');
    expect(liveKitClientUrl('https://ravi-uaxfnmcu.livekit.cloud')).toBe('wss://ravi-uaxfnmcu.livekit.cloud');
  });
});
