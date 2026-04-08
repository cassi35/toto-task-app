
import {Role} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class Employee {
  @ApiProperty({
  type: `integer`,
  format: `int32`,
})
id: number ;
name: string ;
email: string ;
@ApiProperty({
  enum: Role,
})
role: Role ;
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
