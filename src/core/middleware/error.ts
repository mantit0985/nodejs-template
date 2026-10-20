import { logger } from '../logger.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (_err: Error, _req: any, res: any, _next: any) => {
  if (_err instanceof AppError) {
    logger.warn({ statusCode: _err.statusCode, message: _err.message }, 'Operational error');
    return res.status(_err.statusCode).json({
      status: 'error',
      message: _err.message,
    });
  }

  logger.error({ err: _err }, 'Unhandled programmer error');
  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};
