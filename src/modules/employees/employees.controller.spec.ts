import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesModule } from './employees.module';
import { DatabaseService } from 'src/database/database.service';
import { Role } from '@prisma/client';

describe('EmployeesController', () => {
  let controller: EmployeesController;
  let db: DatabaseService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EmployeesModule],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
    db = module.get<DatabaseService>(DatabaseService);
  });

  beforeEach(async () => {
    await db.employee.deleteMany();
  });

  afterAll(async () => {
    await db.employee.deleteMany();
    await db.$disconnect();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an employee', async () => {
    const employee = await controller.create({
      name: 'Alice',
      email: 'alice@test.com',
      role: Role.ENGINEER,
    });

    expect(employee.id).toBeDefined();
    expect(employee.name).toBe('Alice');
    expect(employee.email).toBe('alice@test.com');
    expect(employee.role).toBe(Role.ENGINEER);
  });

  it('should return employees filtered by role', async () => {
    await controller.create({
      name: 'Bob',
      email: 'bob@test.com',
      role: Role.INTERN,
    });
    await controller.create({
      name: 'Carol',
      email: 'carol@test.com',
      role: Role.ADMIN,
    });

    const interns = await controller.findAll('127.0.0.1', Role.INTERN);

    expect(interns).toHaveLength(1);
    expect(interns[0].name).toBe('Bob');
    expect(interns[0].role).toBe(Role.INTERN);
  });

  it('should update an employee', async () => {
    const employee = await controller.create({
      name: 'Dan',
      email: 'dan@test.com',
      role: Role.INTERN,
    });

    const updated = await controller.update(String(employee.id), {
      role: Role.ADMIN,
    });

    expect(updated.id).toBe(employee.id);
    expect(updated.role).toBe(Role.ADMIN);
  });

  it('should remove an employee', async () => {
    const employee = await controller.create({
      name: 'Eve',
      email: 'eve@test.com',
      role: Role.ENGINEER,
    });

    await controller.remove(String(employee.id));
    const found = await controller.findOne(String(employee.id));

    expect(found).toBeNull();
  });
});
