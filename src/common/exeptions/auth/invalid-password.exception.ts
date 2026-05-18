import { HttpException, HttpStatus } from '@nestjs/common';

export default class InvalidPasswordException extends HttpException {
  constructor() {
    super('Invalid password', HttpStatus.BAD_REQUEST);
  }
}
