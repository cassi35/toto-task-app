import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from 'src/database/database.service';
import { UsersService } from 'src/modules/users/users.service';
import { databaseServiceMock } from 'test/mock/database.mock';
import { PrismaErrorCode } from 'src/enums/error';
import { Prisma } from '@prisma/client';
import { userFixture } from 'test/fixtures/auth';

describe('UsersService (unit)', () => {
  let service: UsersService;
  let db: DatabaseService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DatabaseService, useValue: databaseServiceMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    db = module.get<DatabaseService>(DatabaseService);
  });
  describe.skip('create', () => {
    it('should create a new user', async () => {
      databaseServiceMock.user.create.mockResolvedValue(userFixture);

      const result = await service.create(userFixture);

      expect(databaseServiceMock.user.create).toHaveBeenCalledWith({
        data: userFixture,
      });
      expect(result).toEqual(userFixture);
      console.log(result);
    });
    it('should throw unique constraint error', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '6.0.0',
        },
      );

      databaseServiceMock.user.create.mockRejectedValue(prismaError);

      await expect(service.create(userFixture)).rejects.toThrow();
    });
  });
  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const user = { id: 1, ...userFixture };
      databaseServiceMock.user.findUnique.mockResolvedValue(user);

      const result = await service.finEmail(userFixture.email);

      expect(databaseServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: userFixture.email },
      });
      expect(result).toEqual(user);
    });
  });
  describe('findAll', () => {
    it('should findAll with email filter (contains, insensitive)', async () => {
      const users = [{ id: 1, ...userFixture }];
      databaseServiceMock.user.findMany.mockResolvedValue(users);

      const result = await service.findAll('teste@gmail.com');

      expect(databaseServiceMock.user.findMany).toHaveBeenCalledWith({
        where: {
          email: { contains: 'teste@gmail.com', mode: 'insensitive' },
        },
      });
      expect(result).toEqual(users);
    });
  });
  describe('findOne', () => {
    it('should find user by id', async () => {
      const user = { id: 5, ...userFixture };
      databaseServiceMock.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne(5);

      expect(databaseServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
      });
      expect(result).toEqual(user);
    });
  });
  describe('update', () => {
    it('should update user by id', async () => {
      const updated = { id: 7, ...userFixture, password: 'new-pass' };
      const updateDto = { password: 'new-pass' } as any;
      databaseServiceMock.user.update.mockResolvedValue(updated);

      const result = await service.update(7, updateDto);

      expect(databaseServiceMock.user.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: updateDto,
      });
      expect(result).toEqual(updated);
    });
  });
  describe('remove', () => {
    it('should remove user by id', async () => {
      const removed = { id: 7, ...userFixture };
      databaseServiceMock.user.delete.mockResolvedValue(removed);

      const result = await service.remove(7);

      expect(databaseServiceMock.user.delete).toHaveBeenCalledWith({
        where: { id: 7 },
      });
      expect(result).toEqual(removed);
    });
  });
  describe('findByUserId', () => {
    it('should findByUserId', async () => {
      const user = { id: 9, ...userFixture };
      databaseServiceMock.user.findUnique.mockResolvedValue(user);

      const result = await service.findByUserId(9);

      expect(databaseServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 9 },
      });
      expect(result).toEqual(user);
    });
  });
});
