import 'server-only';

import { getDb } from '@/lib/db';

export const EXPECTED_SCHEMA_VERSION = '002_product_hardening';

export const REQUIRED_TABLES = [
  'schema_migrations',
  'users',
  'skills',
  'user_skills',
  'matches',
  'conversations',
  'conversation_members',
  'messages',
  'roadmaps',
  'learning_sessions',
  'analytics_events',
  'user_blocks',
  'notifications',
  'session_feedback',
  'moderation_events',
  'support_requests',
] as const;

export function evaluateSchemaState(tables: readonly string[], version: string | null) {
  const present = new Set(tables);
  const missingTables = REQUIRED_TABLES.filter((table) => !present.has(table));
  return {
    ready: missingTables.length === 0 && version === EXPECTED_SCHEMA_VERSION,
    missingTables,
    version,
  };
}

export async function checkSchemaVersion() {
  const sql = getDb();
  const tableRows = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
  `;

  const tables = tableRows.map((row) => String(row.table_name));
  if (!tables.includes('schema_migrations')) return evaluateSchemaState(tables, null);

  const versionRows = await sql`
    SELECT version
    FROM schema_migrations
    ORDER BY applied_at DESC, version DESC
    LIMIT 1
  `;
  const version = versionRows[0]?.version ? String(versionRows[0].version) : null;
  return evaluateSchemaState(tables, version);
}
