
import {Role} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'




export class UpdateEmployeeDto {
  name?: string;
email?: string;
@ApiProperty({
  enum: Role,
})
role?: Role;
}
