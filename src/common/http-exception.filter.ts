import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const responseMessage =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
        ? exceptionResponse.message
        : exception instanceof HttpException
          ? exception.message
          : 'Internal server error';
    const error =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'error' in exceptionResponse &&
      typeof exceptionResponse.error === 'string'
        ? exceptionResponse.error
        : status >= 500
          ? 'Internal Server Error'
          : 'Request Error';

    if (status >= 500) {
      this.logger.error(
        JSON.stringify({
          event: 'http_exception',
          statusCode: status,
          method: request.method,
          path: request.url,
          error:
            exception instanceof Error ? exception.message : 'Unknown error',
        }),
      );
    }

    const body: ErrorResponse = {
      statusCode: status,
      error,
      message:
        typeof responseMessage === 'string' || Array.isArray(responseMessage)
          ? responseMessage
          : 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };
    response.status(status).json(body);
  }
}
