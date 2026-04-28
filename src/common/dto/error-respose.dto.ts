import { ApiProperty } from '@nestjs/swagger';
export class ErrorResonseDto {
  @ApiProperty({ example: 400, description: 'error response status code' })
  statusCode!: number;
  @ApiProperty({
    example: 'Bad Request',
    description: 'error response message',
  })
  message!: string;
  @ApiProperty({
    example: false,
    description: 'error response success status',
  })
  success!: boolean;
  @ApiProperty({ example: '/api/auth/login' })
  path!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  timestamp!: string;
}
