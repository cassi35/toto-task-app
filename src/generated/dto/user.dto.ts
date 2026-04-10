
import {AuthProvider} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class UserDto {
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
}
