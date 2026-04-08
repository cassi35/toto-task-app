import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
export class LoginDto {
  @ApiProperty({
    example: 'cgr@gmail.com',
    description: 'E-mail do usuário para login',
  })
  @IsEmail()
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
