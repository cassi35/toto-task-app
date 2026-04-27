import { ApiProperty } from '@nestjs/swagger';
export class AtuhResponseDto {
  @ApiProperty({
    type: String,
    required: false,
    example: 'qieinasjaksc',
    description: 'access token',
    title: 'Acess token',
  })
  token?: string;
  @ApiProperty({
    required: true,
    type: Number,
    example: 200,
    description: 'status code',
    title: 'Status code',
  })
  statusCode!: number;
  @ApiProperty({
    required: true,
    type: Boolean,
    example: true,
    description: 'indicates if the operation was successful',
    title: 'Success',
  })
  success!: boolean;
  @ApiProperty({
    required: true,
    type: String,
    example: 'qieinasjaksc',
    description: 'message of response to be sent to the client',
    title: 'Message',
  })
  message!: string;
  @ApiProperty({
    required: false,
    type: Boolean,
    example: false,
    description: 'indicates if the user is verified',
    title: 'Verified',
  })
  verified?: boolean;
  @ApiProperty({
    required: false,
    type: String,
    example: 'qieinasjaksc',
    description: 'cookie string to be set in the response header',
    title: 'Cookie',
  })
  cookie?: string;
}
