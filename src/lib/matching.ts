export function matchScoreFromCompatibility(compatibilityCount: number) {
  if (!Number.isFinite(compatibilityCount) || compatibilityCount <= 0) return 0;
  return Math.min(100, Math.round(compatibilityCount * 50));
}

export function liveKitRoomName(sessionId: string) {
  return `skillswap-${sessionId}`;
}
