import { describe, expect, it } from 'vitest';
import { EXPECTED_SCHEMA_VERSION, evaluateSchemaState, REQUIRED_TABLES } from '@/lib/migrations';

describe('evaluateSchemaState', () => {
  it('fails when a required table is missing', () => {
    const tables = REQUIRED_TABLES.filter((table) => table !== 'users');
    expect(evaluateSchemaState(tables, EXPECTED_SCHEMA_VERSION).ready).toBe(false);
  });

  it('fails when migration version is stale', () => {
    expect(evaluateSchemaState([...REQUIRED_TABLES], '001_baseline').ready).toBe(false);
  });

  it('passes only with all tables and the expected version', () => {
    expect(evaluateSchemaState([...REQUIRED_TABLES], EXPECTED_SCHEMA_VERSION)).toEqual({
      ready: true,
      missingTables: [],
      version: EXPECTED_SCHEMA_VERSION,
    });
  });
});
