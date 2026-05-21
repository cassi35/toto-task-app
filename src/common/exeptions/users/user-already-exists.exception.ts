import { HttpException, HttpStatus } from '@nestjs/common';

export default class UserAlreadyExistsException extends HttpException {
  constructor() {
    super('User already exists', HttpStatus.BAD_REQUEST);
  }
}
