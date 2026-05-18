import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';
import EmployeeNotFoundException from 'src/common/exeptions/employees/employee-not-found.exception';
DatabaseService;
@Injectable()
export class EmployeesService {
  constructor(private databaseService: DatabaseService) {}
  async create(createEmployeeDto: Prisma.EmployeeCreateInput) {
    return await this.databaseService.employee.create({
      data: createEmployeeDto,
    });
  }

  async findAll(role: 'INTERN' | 'ENGINEER' | 'ADMIN') {
    return await this.databaseService.employee.findMany({
      where: {
        role: role,
      },
    });
  }

  async findOne(id: number) {
    const employee = await this.databaseService.employee.findUnique({
      where: {
        id: id,
      },
    });
    if (!employee) {
      throw new EmployeeNotFoundException();
    }
    return employee;
  }

  async update(id: number, updateEmployeeDto: Prisma.EmployeeUpdateInput) {
    const employee = await this.findOne(id);
    return await this.databaseService.employee.update({
      where: {
        id: employee.id,
      },
      data: updateEmployeeDto,
    });
  }

  async remove(id: number) {
    const employee = await this.findOne(id);
    return await this.databaseService.employee.delete({
      where: {
        id: employee.id,
      },
    });
  }
}
