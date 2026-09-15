export function parseBearerToken(header: string | null) {
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export function isDemoAuthAllowed(nodeEnv = process.env.NODE_ENV, flag = process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH) {
  return nodeEnv !== 'production' && flag === 'true';
}
