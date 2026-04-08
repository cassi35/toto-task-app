
import {TokenType} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class TokenDto {
  @ApiProperty({
  type: `integer`,
  format: `int32`,
})
id: number ;
token: string ;
@ApiProperty({
  enum: TokenType,
})
type: TokenType ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
expiresAt: Date ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
createdAt: Date ;
}
