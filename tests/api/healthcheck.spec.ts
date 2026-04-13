import { expect, test } from '../../src/fixtures/base';

test.describe('Healthcheck', () => {
  test('GET /api/v1/healthcheck returns 200 with healthy status', async ({ apiClient }) => {
    const response = await apiClient.healthcheck();

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('healthy');
  });
});
