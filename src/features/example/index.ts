import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
});

export default async function exampleRoutes(fastify: FastifyInstance) {
  fastify.post('/test-validation', async (request, reply) => {
    const result = UserSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({
        error: 'Validation Failed',
        details: result.error.format(),
      });
    }
    return { message: 'Validated successfully!', data: result.data };
  });
}
