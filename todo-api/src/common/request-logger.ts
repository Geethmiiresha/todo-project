import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const logger = new Logger('HTTP');

export function createRequestLogger() {
  return (request: Request, response: Response, next: NextFunction): void => {
    const startedAt = Date.now();
    response.on('finish', () => {
      logger.log(
        JSON.stringify({
          event: 'http_request',
          method: request.method,
          path: request.originalUrl,
          statusCode: response.statusCode,
          durationMs: Date.now() - startedAt,
        }),
      );
    });
    next();
  };
}
