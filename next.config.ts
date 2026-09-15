import type { NextConfig } from 'next';

const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL;
let livekitConnect = '';
try {
  if (livekitUrl) {
    const url = new URL(livekitUrl.replace(/^ws/, 'http'));
    livekitConnect = ` ${url.origin} ${url.origin.replace(/^http/, 'ws')}`;
  }
} catch {}

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  `connect-src 'self' https://openrouter.ai https://integrate.api.nvidia.com https://*.livekit.cloud wss://*.livekit.cloud https://*.blob.vercel-storage.com${livekitConnect}`,
  "media-src 'self' blob: https://*.blob.vercel-storage.com",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
    ] }];
  },
};
export default nextConfig;
