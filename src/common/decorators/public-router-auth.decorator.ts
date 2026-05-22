import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from './public.decorator';
import { Throttle } from '@nestjs/throttler';
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';
import { AtuhResponseDto } from 'src/modules/auth/dto/response/base-response.dto';
import { ErrorResonseDto } from '../dto/error-respose.dto';

export function PublicAuthRoute(
  limit = 5,
  ttl = 60000,
  statuscode: HttpStatus,
) {
  return applyDecorators(
    Public(),
    Throttle({
      default: {
        limit,
        ttl,
      },
    }),
    ApiOkResponse({
      type: AtuhResponseDto,
    }),
    ApiBadRequestResponse({
      type: ErrorResonseDto,
    }),
    HttpCode(statuscode),
  );
}
export function PrivateRouteAuth(statuscode: HttpStatus) {
  return applyDecorators(
    ApiOkResponse({
      type: AtuhResponseDto,
    }),
    ApiBadRequestResponse({
      type: ErrorResonseDto,
    }),
    HttpCode(statuscode),
  );
}
