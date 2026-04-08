import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';
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
    return await this.databaseService.employee.findUnique({
      where: {
        id: id,
      },
    });
  }

  async update(id: number, updateEmployeeDto: Prisma.EmployeeUpdateInput) {
    return await this.databaseService.employee.update({
      where: {
        id: id,
      },
      data: updateEmployeeDto,
    });
  }

  async remove(id: number) {
    return await this.databaseService.employee.delete({
      where: {
        id: id,
      },
    });
  }
}
