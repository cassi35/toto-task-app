
import {AuthProvider} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {Token} from './token.entity'


export class User {
  @ApiProperty({
  type: `integer`,
  format: `int32`,
})
id: number ;
email: string ;
password: string  | null;
@ApiProperty({
  enum: AuthProvider,
})
provider: AuthProvider  | null;
providerId: string  | null;
isActive: boolean ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
createdAt: Date ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
updatedAt: Date ;
tokens?: Token[] ;
}
