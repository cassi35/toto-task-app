import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '@prisma/client'; // Importa o Enum gerado pelo Prisma

export class CreateEmployeeDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do funcionário',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'joao@empresa.com',
    description: 'E-mail corporativo único',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    enum: Role,
    example: Role.ENGINEER,
    description: 'Cargo do funcionário dentro da empresa',
  })
  @IsEnum(Role)
  role!: Role;
}
