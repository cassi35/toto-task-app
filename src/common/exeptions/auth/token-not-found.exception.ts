import { HttpException, HttpStatus } from '@nestjs/common';

export default class TokenNotFoundException extends HttpException {
  constructor() {
    super('Token not found', HttpStatus.NOT_FOUND);
  }
}
