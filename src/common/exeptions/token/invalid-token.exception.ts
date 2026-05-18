import { HttpException, HttpStatus } from '@nestjs/common';

export default class InvalidTokenException extends HttpException {
  constructor() {
    super('Token inválido', HttpStatus.BAD_REQUEST);
  }
}
