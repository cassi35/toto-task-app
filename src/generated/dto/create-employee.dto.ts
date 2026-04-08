
import {Role} from '@prisma/client'
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreateEmployeeDto {
  name: string;
email: string;
@ApiProperty({
  enum: Role,
})
role: Role;
}
