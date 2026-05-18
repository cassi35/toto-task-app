import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { EmployeesController } from 'src/modules/employees/employees.controller';
import { EmployeesService } from 'src/modules/employees/employees.service';
import EmployeeNotFoundException from 'src/common/exeptions/employees/employee-not-found.exception';
import { employeesServiceMock } from 'test/mock/services/employee.mock';

describe('EmployeesController', () => {
  let controller: EmployeesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        { provide: EmployeesService, useValue: employeesServiceMock },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an employee', async () => {
    const created = {
      id: 1,
      name: 'Alice',
      email: 'alice@test.com',
      role: Role.ENGINEER,
    };
    employeesServiceMock.create.mockResolvedValue(created);

    const result = await controller.create({
      name: 'Alice',
      email: 'alice@test.com',
      role: Role.ENGINEER,
    });

    expect(employeesServiceMock.create).toHaveBeenCalled();
    expect(result).toEqual(created);
  });

  it('should return employees filtered by role', async () => {
    const interns = [
      {
        id: 2,
        name: 'Bob',
        email: 'bob@test.com',
        role: Role.INTERN,
      },
    ];
    employeesServiceMock.findAll.mockResolvedValue(interns);

    const result = await controller.findAll('127.0.0.1', Role.INTERN);

    expect(employeesServiceMock.findAll).toHaveBeenCalledWith(Role.INTERN);
    expect(result).toEqual(interns);
  });

  it('should update an employee', async () => {
    const updated = {
      id: 3,
      name: 'Dan',
      email: 'dan@test.com',
      role: Role.ADMIN,
    };
    employeesServiceMock.update.mockResolvedValue(updated);

    const result = await controller.update('3', { role: Role.ADMIN });

    expect(employeesServiceMock.update).toHaveBeenCalledWith(3, {
      role: Role.ADMIN,
    });
    expect(result).toEqual(updated);
  });

  it('should remove an employee', async () => {
    employeesServiceMock.remove.mockResolvedValue({ id: 4 });
    employeesServiceMock.findOne.mockRejectedValue(
      new EmployeeNotFoundException(),
    );

    await controller.remove('4');

    await expect(controller.findOne('4')).rejects.toThrow(
      new EmployeeNotFoundException(),
    );
  });
});
