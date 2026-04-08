import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'cgr@gmail.com',
    description: 'E-mail para criação da conta',
  })
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'Senha@123',
    description: 'Senha de acesso (mínimo 8 caracteres)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  password!: string;
}
