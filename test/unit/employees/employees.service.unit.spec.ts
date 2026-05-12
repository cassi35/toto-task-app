import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { DatabaseService } from 'src/database/database.service';
import { EmployeesService } from 'src/modules/employees/employees.service';
import { databaseServiceMock } from 'test/mock/database.mock';

describe('EmployeesService (unit)', () => {
  let service: EmployeesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: DatabaseService, useValue: databaseServiceMock },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  it('should create an employee', async () => {
    const input: Prisma.EmployeeCreateInput = {
      name: 'Cassiano',
      email: 'mestre@gmail.com',
      role: 'ENGINEER',
    };

    const created = { id: 1, ...input };
    databaseServiceMock.employee.create.mockResolvedValue(created);

    const result = await service.create(input);

    expect(databaseServiceMock.employee.create).toHaveBeenCalledWith({
      data: input,
    });
    expect(result).toEqual(created);
  });

  it('should return all employees by role', async () => {
    const role = 'ENGINEER' as const;

    const employees = [
      {
        id: 1,
        name: 'Cassiano',
        email: 'mestre@gmail.com',
        role,
      },
    ];

    databaseServiceMock.employee.findAll.mockResolvedValue({
      employees,
    });

    const result = await service.findAll(role);

    expect(databaseServiceMock.employee.findAll).toHaveBeenCalledWith({
      where: { role },
    });
    expect(result).toEqual(employees);
  });

  it('should return employee by id', async () => {
    const employee = {
      id: 7,
      name: 'Cassiano',
      email: 'mestre@gmail.com',
      role: 'ENGINEER',
    };

    databaseServiceMock.employee.findOne.mockResolvedValue(employee);

    const result = await service.findOne(7);

    expect(databaseServiceMock.employee.findOne).toHaveBeenCalledWith({
      where: { id: 7 },
    });
    expect(result).toEqual(employee);
  });

  it('should throw NotFoundException if employee does not exist', async () => {
    databaseServiceMock.employee.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    await expect(service.findOne(999)).rejects.toThrow('Employee not found');
  });

  it('should update employee', async () => {
    const existing = {
      id: 7,
      name: 'Cassiano',
      email: 'mestre@gmail.com',
      role: 'ENGINEER',
    };

    const updateDto = { name: 'Updated' } as Prisma.EmployeeUpdateInput;
    const updated = { ...existing, ...updateDto, id: existing.id };

    databaseServiceMock.employee.findOne.mockResolvedValue(existing);
    databaseServiceMock.employee.update.mockResolvedValue(updated);

    const result = await service.update(existing.id, updateDto);

    expect(databaseServiceMock.employee.update).toHaveBeenCalledWith({
      where: { id: existing.id },
      data: updateDto,
    });
    expect(result).toEqual(updated);
  });

  it('should remove employee by id', async () => {
    const existing = {
      id: 7,
      name: 'Cassiano',
      email: 'mestre@gmail.com',
      role: 'ENGINEER',
    };

    databaseServiceMock.employee.findOne.mockResolvedValue(existing);
    databaseServiceMock.employee.remove.mockResolvedValue(existing);

    const result = await service.remove(existing.id);

    expect(databaseServiceMock.employee.remove).toHaveBeenCalledWith({
      where: { id: existing.id },
    });
    expect(result).toEqual(existing);
  });
});
