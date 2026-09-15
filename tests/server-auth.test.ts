import { describe, expect, it } from 'vitest';
import { isDemoAuthAllowed, parseBearerToken } from '@/lib/auth-utils';

describe('parseBearerToken', () => {
  it('returns null when authorization is missing', () => {
    expect(parseBearerToken(null)).toBeNull();
  });

  it('returns null for non-bearer authorization', () => {
    expect(parseBearerToken('Basic abc')).toBeNull();
  });

  it('extracts a bearer token', () => {
    expect(parseBearerToken('Bearer token-123')).toBe('token-123');
  });
});

describe('isDemoAuthAllowed', () => {
  it('never enables demo auth in production', () => {
    expect(isDemoAuthAllowed('production', 'true')).toBe(false);
  });

  it('requires the explicit flag outside production', () => {
    expect(isDemoAuthAllowed('development', undefined)).toBe(false);
    expect(isDemoAuthAllowed('development', 'true')).toBe(true);
  });
});
