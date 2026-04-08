
import {TokenType} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'




export class UpdateTokenDto {
  token?: string;
@ApiProperty({
  enum: TokenType,
})
type?: TokenType;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
expiresAt?: Date;
}
