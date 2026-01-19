import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            statusCode: status,
            message: exception instanceof Error ? exception.message : 'Internal server error',
            error: exception instanceof Error ? exception.stack : String(exception),
          };

    console.error('=== 异常捕获 ===');
    console.error('URL:', request.url);
    console.error('Method:', request.method);
    console.error('Body:', request.body);
    console.error('Status:', status);
    console.error('Message:', message);
    if (exception instanceof Error) {
      console.error('Stack:', exception.stack);
    }

    response.status(status).json(message);
  }
}

