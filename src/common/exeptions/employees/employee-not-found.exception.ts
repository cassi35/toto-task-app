import { HttpException, HttpStatus } from '@nestjs/common';

export default class EmployeeNotFoundException extends HttpException {
  constructor() {
    super('Employee not found', HttpStatus.NOT_FOUND);
  }
}
