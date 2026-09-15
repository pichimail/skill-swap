import { describe, expect, it } from 'vitest';
import { normalizeGoogleSessionUser } from '@/lib/auth-session';

describe('normalizeGoogleSessionUser', () => {
  it('maps a Google OAuth subject to a stable provider-scoped user id', () => {
    expect(normalizeGoogleSessionUser({
      googleSub: '1234567890',
      email: 'person@example.com',
      name: 'Person',
    })).toEqual({
      uid: 'google:1234567890',
      email: 'person@example.com',
      displayName: 'Person',
    });
  });

  it('rejects a missing Google subject', () => {
    expect(() => normalizeGoogleSessionUser({
      googleSub: null,
      email: 'person@example.com',
      name: 'Person',
    })).toThrow('Google account identifier is missing');
  });

  it('normalizes optional profile fields to null', () => {
    expect(normalizeGoogleSessionUser({ googleSub: 'abc' })).toEqual({
      uid: 'google:abc',
      email: null,
      displayName: null,
    });
  });
});
