import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { EmployeesService } from 'src/modules/employees/employees.service';
import {
  createEmployeeFixture,
  employeeFixture,
  employeesFixture,
  updateEmployeeFixture,
} from 'test/fixtures/employee.fixture';
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

  describe('create', () => {
    it('should create employee', async () => {
      databaseServiceMock.employee.create.mockResolvedValue(employeeFixture);

      const result = await service.create(createEmployeeFixture);

      expect(databaseServiceMock.employee.create).toHaveBeenCalledWith({
        data: createEmployeeFixture,
      });
      expect(result).toEqual(employeeFixture);
    });
  });

  describe('findAll', () => {
    it('should return employees by role', async () => {
      databaseServiceMock.employee.findMany.mockResolvedValue(employeesFixture);

      const result = await service.findAll(Role.ENGINEER);

      expect(databaseServiceMock.employee.findMany).toHaveBeenCalledWith({
        where: { role: Role.ENGINEER },
      });
      expect(result).toEqual(employeesFixture);
    });
  });

  describe('findOne', () => {
    it('should return employee by id', async () => {
      databaseServiceMock.employee.findUnique.mockResolvedValue(employeeFixture);

      const result = await service.findOne(employeeFixture.id);

      expect(databaseServiceMock.employee.findUnique).toHaveBeenCalledWith({
        where: { id: employeeFixture.id },
      });
      expect(result).toEqual(employeeFixture);
    });

    it('should throw when employee is not found', async () => {
      databaseServiceMock.employee.findUnique.mockResolvedValue(null);

      await expect(service.findOne(employeeFixture.id)).rejects.toThrow(
        new NotFoundException('Employee not found'),
      );
    });
  });

  describe('update', () => {
    it('should update employee by id', async () => {
      const updatedEmployee = { ...employeeFixture, ...updateEmployeeFixture };
      databaseServiceMock.employee.findUnique.mockResolvedValue(employeeFixture);
      databaseServiceMock.employee.update.mockResolvedValue(updatedEmployee);

      const result = await service.update(employeeFixture.id, updateEmployeeFixture);

      expect(databaseServiceMock.employee.update).toHaveBeenCalledWith({
        where: { id: employeeFixture.id },
        data: updateEmployeeFixture,
      });
      expect(result).toEqual(updatedEmployee);
    });
  });

  describe('remove', () => {
    it('should remove employee by id', async () => {
      databaseServiceMock.employee.findUnique.mockResolvedValue(employeeFixture);
      databaseServiceMock.employee.delete.mockResolvedValue(employeeFixture);

      const result = await service.remove(employeeFixture.id);

      expect(databaseServiceMock.employee.delete).toHaveBeenCalledWith({
        where: { id: employeeFixture.id },
      });
      expect(result).toEqual(employeeFixture);
    });
  });
});
