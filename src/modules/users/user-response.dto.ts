import { ApiProperty } from '@nestjs/swagger';
import { AuthProvider } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'id do usuario', title: 'ID' })
  id!: number;

  @ApiProperty({
    example: 'usuario@email.com',
    description: 'email do usuario',
    title: 'Email',
    type: String,
  })
  email!: string;

  @ApiProperty({
    enum: AuthProvider,
    required: false,
    nullable: true,
    description: 'provedor de autenticacao do usuario',
    title: 'Provider',
    type: String,
  })
  provider?: AuthProvider | null;

  @ApiProperty({
    example: true,
    description: 'indica se o usuario esta ativo',
    title: 'Ativo',
    type: Boolean,
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2026-01-01T00:00:00.000Z',
    description: 'data de criacao do usuario',
    title: 'Criado em',
    type: String,
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-01T00:00:00.000Z',
    description: 'data da ultima atualizacao do usuario',
    title: 'Atualizado em',
    type: String,
    format: 'date-time',
  })
  updatedAt!: Date;
}
