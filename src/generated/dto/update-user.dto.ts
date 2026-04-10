
import {AuthProvider} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'




export class UpdateUserDto {
  email?: string;
password?: string;
@ApiProperty({
  enum: AuthProvider,
})
provider?: AuthProvider;
providerId?: string;
}
