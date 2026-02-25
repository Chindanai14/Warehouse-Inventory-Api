import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly isProd = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx     = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    let status:  number          = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null && 'message' in res) {
        message = (res as { message: string | string[] }).message;
      } else {
        message = typeof res === 'string' ? res : 'Internal server error';
      }
    } else if (exception instanceof Error) {
      // ✅ MongoDB Duplicate Key Error
      const error = exception as unknown as {
        code?: number;
        keyPattern?: Record<string, unknown>;
      };
      if (error.code === 11000) {
        status = HttpStatus.CONFLICT;
        const field = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'field';
        message = `${field} นี้มีอยู่ในระบบแล้ว`;
      } else {
        // ✅ FIX: ซ่อน internal error detail ใน production
        message = this.isProd ? 'Internal server error' : exception.message;
      }
    }

    // Log ทุก error พร้อม stack trace (server-side เท่านั้น)
    this.logger.error(
      `${request.method} ${request.url} — ${status}: ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message,
      path:      request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
