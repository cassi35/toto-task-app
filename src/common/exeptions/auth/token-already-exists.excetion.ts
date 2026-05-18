import { HttpException, HttpStatus } from '@nestjs/common';

export default class TokenAlreadyExistsException extends HttpException {
  constructor() {
    super('Token already exists', HttpStatus.BAD_REQUEST);
  }
}
