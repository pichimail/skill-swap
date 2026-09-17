import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['001_baseline.sql', '002_product_hardening.sql'];

function splitStatements(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line) => (line.trim().startsWith('--') ? '' : line))
    .join('\n')
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    if (process.env.SKIP_DB_MIGRATE === '1' || process.env.CI === 'true') {
      console.log('Skipping database migrations (DATABASE_URL not set).');
      return;
    }
    throw new Error('DATABASE_URL is required to apply migrations.');
  }

  const sql = neon(url);
  for (const file of files) {
    const source = readFileSync(join(root, 'db/migrations', file), 'utf8');
    for (const statement of splitStatements(source)) {
      await sql.query(statement);
    }
    console.log(`Applied ${file}`);
  }

  const tables = await sql.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
  );
  const versions = await sql.query('SELECT version, applied_at FROM schema_migrations ORDER BY applied_at');
  console.log('tables', tables.map((row) => row.table_name).join(', '));
  console.log('migrations', versions.map((row) => row.version).join(', '));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
