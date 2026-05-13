import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  ExceptionFilter,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';
import { PrismaErrorCode } from './enums/error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const res = exception.getResponse();
      message = typeof res === 'string' ? res : res['message'] || res;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case PrismaErrorCode.USER_ALREADY_EXISTS:
          status = HttpStatus.CONFLICT;
          message = 'Unique constraint failed';
          break;

        case PrismaErrorCode.RECORD_NOT_FOUND:
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;

        case PrismaErrorCode.FOREIGN_KEY_FAILED:
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed';
          break;

        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Database error';
          break;
      }
    }

    response.status(status).send({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
