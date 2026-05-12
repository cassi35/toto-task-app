import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from 'src/database/database.service';
import { UsersService } from 'src/modules/users/users.service';
import { databaseServiceMock } from 'test/mock/database.mock';
import { userFixture } from 'test/fixtures/auth';

describe('UsersService (unit)', () => {
  let service: UsersService;
  let db: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DatabaseService, useValue: databaseServiceMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    db = module.get<DatabaseService>(DatabaseService);
  });
  describe('create', () => {
    it('should create a new user', async () => {
      databaseServiceMock.user.create.mockResolvedValue(userFixture);

      const result = await service.create(userFixture);

      expect(databaseServiceMock.user.create).toHaveBeenCalledWith({
        data: userFixture,
      });
      expect(result).toEqual(userFixture);
      expect(db.$disconnect).toHaveBeenCalled();
      console.log(result);
    });
  });
  describe.skip('findByEmail', () => {
    it('should findAll without email filter', async () => {
      const users = [{ id: 1, ...userFixture }];
      databaseServiceMock.user.findMany.mockResolvedValue(userFixture);

      const result = await service.findAll();

      expect(databaseServiceMock.user.findMany).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toEqual(users);
    });
  });
  describe.skip('findAll', () => {
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
  describe.skip('findOne', () => {});
  describe.skip('update', () => {
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
  describe.skip('remove', () => {
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
  describe.skip('findByUserId', () => {
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
