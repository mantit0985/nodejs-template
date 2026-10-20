import { logger } from '../../core/logger.js';

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
}

export class HealthService {
  async checkHealth(): Promise<HealthStatus> {
    try {
      const memory = process.memoryUsage();

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          heapUsed: memory.heapUsed,
          heapTotal: memory.heapTotal,
          rss: memory.rss,
        },
      };
    } catch (error) {
      logger.error({ error }, 'Health check failed');
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          heapUsed: 0,
          heapTotal: 0,
          rss: 0,
        },
      };
    }
  }
}

export const healthService = new HealthService();
