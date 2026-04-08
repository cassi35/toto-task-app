import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationTokenDto {
  @ApiProperty({
    example: 'joao@empresa.com',
    description:
      'E-mail do usuário para reenvio do link de confirmação de conta',
  })
  @IsEmail({}, { message: 'O formato do e-mail é inválido' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  email!: string;
}
