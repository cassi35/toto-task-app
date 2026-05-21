import { HttpException, HttpStatus } from '@nestjs/common';

export default class UserNotActiveException extends HttpException {
  constructor() {
    super('User not active', HttpStatus.BAD_REQUEST);
  }
}
