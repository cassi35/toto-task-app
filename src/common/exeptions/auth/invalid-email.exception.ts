import { HttpException, HttpStatus } from '@nestjs/common';

export default class InvalidEmailException extends HttpException {
  constructor() {
    super('Invalid email', HttpStatus.BAD_REQUEST);
  }
}
