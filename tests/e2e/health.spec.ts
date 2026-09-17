import { expect, test } from '@playwright/test';

test('health endpoint reports infrastructure booleans only', async ({ request }) => {
  const response = await request.get('/api/health');
  const body = await response.json();
  expect(body).toMatchObject({
    database: { configured: expect.any(Boolean) },
    schema: { expected: '002_product_hardening' },
    redis: { configured: expect.any(Boolean) },
    auth: { googleOAuth: expect.any(Boolean) },
    realtime: { livekit: expect.any(Boolean) },
    ai: { ready: expect.any(Boolean) },
  });
  expect(JSON.stringify(body)).not.toMatch(/postgres:|eyJ|sk-|APIS/i);
});
