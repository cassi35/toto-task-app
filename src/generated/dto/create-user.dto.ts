
import {AuthProvider} from '@prisma/client'
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreateUserDto {
  email: string;
password?: string;
@ApiProperty({
  enum: AuthProvider,
})
provider?: AuthProvider;
providerId?: string;
}
