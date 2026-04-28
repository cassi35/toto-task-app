import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
export class EmployeeDto {
  @ApiProperty({ example: 1, description: 'id do funcionario', title: 'ID' })
  id!: number;

  @ApiProperty({
    example: 'João Silva',
    description: 'nome do funcionario',
    title: 'Nome',
    type: String,
  })
  name!: string;

  @ApiProperty({
    example: 'joao@empresa.com',
    description: 'email do funcionario',
    title: 'Email',
    type: String,
  })
  email!: string;

  @ApiProperty({
    enum: Role,
    description: 'cargo do funcionario',
    title: 'Cargo',
    type: String,
  })
  role!: Role;
}
