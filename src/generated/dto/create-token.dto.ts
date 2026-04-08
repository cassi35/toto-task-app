
import {TokenType} from '@prisma/client'
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreateTokenDto {
  token: string;
@ApiProperty({
  enum: TokenType,
})
type: TokenType;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
expiresAt: Date;
}
