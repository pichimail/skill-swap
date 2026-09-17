import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  use: { baseURL, extraHTTPHeaders: { 'cache-control': 'no-store' } },
  retries: 0,
});
