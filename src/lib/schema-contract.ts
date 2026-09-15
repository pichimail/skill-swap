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
