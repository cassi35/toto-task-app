import { Role } from '@prisma/client';

export const createEmployeeFixture = {
  name: 'Joao Silva',
  email: 'joao@empresa.com',
  role: Role.ENGINEER,
};

export const employeeFixture = {
  id: 1,
  ...createEmployeeFixture,
};

export const employeesFixture = [
  employeeFixture,
  {
    id: 2,
    name: 'Maria Souza',
    email: 'maria@empresa.com',
    role: Role.ENGINEER,
  },
];

export const updateEmployeeFixture = {
  name: 'Joao Silva Atualizado',
  role: Role.ADMIN,
};
