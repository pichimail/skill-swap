import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

export const hasDatabase = Boolean(connectionString);

export function getDb() {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured. Connect the Neon Vercel integration to this project.');
  }

  return neon(connectionString);
}
