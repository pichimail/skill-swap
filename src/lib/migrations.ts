import 'server-only';

import { getDb } from '@/lib/db';
import {
  EXPECTED_SCHEMA_VERSION,
  REQUIRED_TABLES,
  evaluateSchemaState,
} from '@/lib/schema-contract';

export { EXPECTED_SCHEMA_VERSION, REQUIRED_TABLES, evaluateSchemaState } from '@/lib/schema-contract';

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
