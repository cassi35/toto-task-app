import { HttpException, HttpStatus } from '@nestjs/common';

export default class InvalidCredentialsException extends HttpException {
  constructor() {
    super('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }
}
