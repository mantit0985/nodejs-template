import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app';

describe('GET /healthz', () => {
  let app: ReturnType<typeof buildApp>;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns ok status with process metadata', async () => {
    const response = await app.inject({ method: 'GET', url: '/healthz' });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toEqual(expect.any(String));
    expect(body.uptime).toBeGreaterThanOrEqual(0);
    expect(body.memory.heapUsed).toBeGreaterThan(0);
  });

  it('exposes a correlation ID header', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/healthz',
      headers: { 'x-request-id': 'test-correlation-id' },
    });

    expect(response.headers['x-request-id']).toBe('test-correlation-id');
  });
});
