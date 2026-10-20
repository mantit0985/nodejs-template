import { FastifyInstance } from 'fastify';
import client from 'prom-client';

async function metricsPlugin(fastify: FastifyInstance) {
  // Create a Registry to register the metrics models in
  const register = new client.Registry();

  // Add a default label which is asubstring of the hostname in the format of 'hostname:port'
  client.collectDefaultMetrics({ register });

  fastify.get('/metrics', async (_request, _reply) => {
    try {
      _reply.header('Content-Type', register.contentType);
      return await register.metrics();
    } catch (error) {
      fastify.log.error({ error }, 'Failed to retrieve metrics');
      return _reply.status(500).send('Internal Server Error');
    }
  });
}

export default metricsPlugin;
