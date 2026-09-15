export type GoogleSessionIdentity = {
  googleSub?: string | null;
  email?: string | null;
  name?: string | null;
};

export type AppAuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

export function normalizeGoogleSessionUser(identity: GoogleSessionIdentity): AppAuthUser {
  const googleSub = identity.googleSub?.trim();
  if (!googleSub) throw new Error('Google account identifier is missing');

  return {
    uid: `google:${googleSub}`,
    email: identity.email?.trim() || null,
    displayName: identity.name?.trim() || null,
  };
}
