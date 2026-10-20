import { FastifyInstance } from 'fastify';
import { healthService } from './service.js';
import { HealthSchema } from './schemas.js';

async function healthPlugin(fastify: FastifyInstance) {
  fastify.get(
    '/healthz',
    { schema: HealthSchema },
    async (_request, _reply) => {
      return await healthService.checkHealth();
    }
  );

  fastify.get(
    '/readyz',
    { schema: HealthSchema },
    async (_request, _reply) => {
      return await healthService.checkHealth();
    }
  );
  fastify.get(
    '/version',
    async (_request, _reply) => {
      return { version: '1.0.0' };
    }
  );
}

export default healthPlugin;
