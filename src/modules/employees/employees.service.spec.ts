import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { DatabaseService } from 'src/database/database.service';
import { DatabaseModule } from 'src/database/database.module';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let db: DatabaseService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeesService],
      imports: [DatabaseModule],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it.skip('should get all employees', async () => {
    const employess = await service.findAll('ENGINEER');
    expect(employess).toBeDefined();

    console.log(employess);
  });
  it('should get an employee by id', async () => {
    const employee = await service.findOne(2);
    expect(employee).toBeDefined();
    console.log(employee);
  });
  it.skip('should delete an employee by id', async () => {
    const deleteEmployee = await service.remove(2);
    expect(deleteEmployee).toBeDefined();
    console.log(deleteEmployee);
  });
});
