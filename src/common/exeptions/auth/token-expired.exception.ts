import { HttpException, HttpStatus } from '@nestjs/common';

export default class TokenExpiredException extends HttpException {
  constructor() {
    super('Token expired', HttpStatus.BAD_REQUEST);
  }
}
