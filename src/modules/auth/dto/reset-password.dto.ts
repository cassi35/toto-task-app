import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-g7h8-i9j0',
    description: 'Token de recuperação enviado por e-mail',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    example: 'NovaSenha@2026',
    description: 'A nova senha que o usuário deseja definir',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'A nova senha deve ter no mínimo 8 caracteres' })
  newPassword!: string;
}
