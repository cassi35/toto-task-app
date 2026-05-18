import { HttpException, HttpStatus } from '@nestjs/common';

export default class UserCreationFailedException extends HttpException {
  constructor() {
    super('User creation failed', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
