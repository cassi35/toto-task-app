import { Test, TestingModule } from '@nestjs/testing';

import { DatabaseService } from 'src/database/database.service';
import { DatabaseModule } from 'src/database/database.module';
import { Prisma } from '@prisma/client';
import { EmployeesService } from 'src/modules/employees/employees.service';

describe('EmployeesService', () => {
  let service: EmployeesService;
  const dbMock = {
    employee: {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    },
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: DatabaseService, useValue: dbMock },
      ],
      imports: [DatabaseModule],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });
  it('should return employee by id', async () => {
    const employee: Prisma.EmployeeCreateInput = {
      name: 'cassinao',
      email: 'mestre@gmail.com',
      role: 'ENGINEER',
    };
    dbMock.employee.create.mockResolvedValue(employee);
    const result = await service.create(employee);
    expect(result).toEqual(employee);
    expect(result.name).not.toBeNull();
    // expect(result.id).not.toBeLessThan(0);
    expect(dbMock.employee.create).toHaveBeenCalledWith({
      data: employee,
    });
    expect(dbMock.employee.create).toHaveBeenCalledTimes(1);
    console.log(result);
  });
  it('should return all employees by role', async () => {
    const employees: Prisma.EmployeeCreateInput[] = [];
  });
});
