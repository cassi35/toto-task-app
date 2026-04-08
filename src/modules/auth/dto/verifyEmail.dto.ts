import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-g7h8-i9j0',
    description: 'Token de verificação único enviado ao e-mail do usuário',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
