
import {TokenType} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {User} from './user.entity'


export class Token {
  @ApiProperty({
  type: `integer`,
  format: `int32`,
})
id: number ;
token: string ;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
userId: number ;
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
user?: User ;
}
