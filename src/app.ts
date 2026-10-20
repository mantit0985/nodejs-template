import Fastify, { FastifyInstance, FastifyError } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config } from './core/config.js';
import { createRequestLogger } from './core/logger.js';
import { errorHandler } from './core/middleware/error.js';
import healthPlugin from './features/health/index.js';
import metricsPlugin from './features/metrics/index.js';
import exampleRoutes from './features/example/index.js';

/**
 * Builds the fully-configured Fastify application instance.
 *
 * Kept separate from the process bootstrap (src/index.ts) so the same
 * instance can be exercised in tests and programmatic consumers.
 */
export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
    },
  });

  // Security Plugins
  app.register(helmet);
  app.register(cors, { origin: '*' });
  app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Request Correlation ID Middleware
  app.addHook('onRequest', async (request, reply) => {
    const requestId =
      (request.headers['x-request-id'] as string) ||
      Math.random().toString(36).substring(7);
    request.log = createRequestLogger(requestId);
    reply.header('x-request-id', requestId);
  });

  // Observability Endpoints (liveness probes and Prometheus scraping)
  app.register(healthPlugin);
  app.register(metricsPlugin);

  // Example of a Validated Route
  app.register(exampleRoutes);

  // Error Handler
  app.setErrorHandler((error: FastifyError, request, reply) => {
    errorHandler(error, request, reply, null);
  });

  return app;
}
