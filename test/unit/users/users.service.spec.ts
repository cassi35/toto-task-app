import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UsersService } from 'src/modules/users/users.service';

describe('UsersService', () => {
  let service: UsersService;
  let db: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
      imports: [DatabaseModule],
    }).compile();

    service = module.get<UsersService>(UsersService);
    db = module.get<DatabaseService>(DatabaseService);
  });
  afterAll(async () => {
    await db.$disconnect();
  });

  it.skip('should be created', async () => {
    try {
      const user = await service.create({
        email: '1@1.com',
        password: 'pass',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(user).toBeDefined();
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.log('client already exists');
      }
      throw error;
    }
  });
  it.skip('should get user', async () => {
    const user = await service.findOne(6);
    expect(user?.id).toBe(8);
    console.log(user);
  });
  it('should get user email', async () => {
    const user = await service.finEmail('1@.com');
    expect(user).toBeNull();
    console.log(user == null);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
