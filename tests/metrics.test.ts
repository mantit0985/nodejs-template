import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app';

describe('GET /metrics', () => {
  let app: ReturnType<typeof buildApp>;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns Prometheus text exposition format', async () => {
    const response = await app.inject({ method: 'GET', url: '/metrics' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.body).toContain('# HELP');
    expect(response.body).toContain('# TYPE');
  });

  it('exposes default Node.js process metrics', async () => {
    const response = await app.inject({ method: 'GET', url: '/metrics' });

    expect(response.body).toContain('nodejs_');
  });
});
