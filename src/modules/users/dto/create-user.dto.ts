import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'O e-mail único do usuário para login',
  })
  @IsEmail({}, { message: 'O e-mail informado é inválido' })
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
