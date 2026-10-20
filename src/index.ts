import { buildApp } from './app.js';
import { config } from './core/config.js';
import { logger } from './core/logger.js';

const server = buildApp();

const start = async () => {
  try {
    await server.listen({ port: config.PORT, host: '0.0.0.0' });
    logger.info(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
  } catch (err) {
    logger.error({ err }, 'Server failed to start');
    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  try {
    await server.close();
    logger.info('HTTP server closed.');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Error during graceful shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
