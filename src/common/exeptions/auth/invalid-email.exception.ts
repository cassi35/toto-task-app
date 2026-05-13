import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidEmailException extends HttpException {
  constructor() {
    super('Invalid email', HttpStatus.BAD_REQUEST);
  }
}
