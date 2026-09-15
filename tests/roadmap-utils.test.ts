import { describe, expect, it } from 'vitest';
import { getClientIp, normalizeSkill } from '@/lib/roadmap-utils';

describe('normalizeSkill', () => {
  it('normalizes case and repeated whitespace', () => {
    expect(normalizeSkill('  Python   For DATA  ')).toBe('python for data');
  });
});

describe('getClientIp', () => {
  it('uses the first forwarded address', () => {
    const request = new Request('https://example.test', { headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.2' } });
    expect(getClientIp(request)).toBe('203.0.113.10');
  });

  it('falls back to x-real-ip and then unknown', () => {
    expect(getClientIp(new Request('https://example.test', { headers: { 'x-real-ip': '198.51.100.5' } }))).toBe('198.51.100.5');
    expect(getClientIp(new Request('https://example.test'))).toBe('unknown');
  });
});
