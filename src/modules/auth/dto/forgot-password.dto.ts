import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
export class ForgotPasswordDto {
  @ApiProperty({
    example: 'joao@empresa.com',
    description: 'E-mail do usuário para recuperação de senha',
  })
  @IsEmail()
  email!: string;
}
