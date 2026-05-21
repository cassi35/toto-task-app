import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
export class MeDto {
  @ApiProperty({
    example: 'cgr@gmail.com',
    description: 'E-mail do usuário para login',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
  @ApiProperty({
    example: 'id of user',
    description: 'id sample kajsdoijasodijas',
  })
  @IsNotEmpty()
  id!: number;
}
