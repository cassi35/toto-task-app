import { Test, TestingModule } from '@nestjs/testing';
import UserAlreadyExistsException from 'src/common/exeptions/users/user-already-exists.exception';
import UserCreationFailedException from 'src/common/exeptions/users/user-creation-failed.exception';
import UserNotActiveException from 'src/common/exeptions/users/user-not-active.exception';
import UserNotFoundException from 'src/common/exeptions/users/user-not-found.exception';
import { UsersService } from 'src/modules/users/users.service';
import UserValidatorService, {
  UserValidationChain,
} from 'src/shared/builders/user.builder';
import {
  inactiveUserEntityFixture,
  userEntityFixture,
} from 'test/fixtures/auth.fixture';
import { usersServiceMock } from 'test/mock/services/authService.mock';

describe('UserBuilder (unit)', () => {
  let builder: UserValidatorService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserValidatorService,
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compile();

    builder = module.get<UserValidatorService>(UserValidatorService);
  });

  const userByEmail = async (): Promise<UserValidationChain> => {
    return await builder.validate(userEntityFixture.email).exists();
  };

  const userById = async (): Promise<UserValidationChain> => {
    return await builder
      .validateByUserId(userEntityFixture.id)
      .existsByUserId();
  };

  const expectEmailLookup = () => {
    expect(usersServiceMock.finEmail).toHaveBeenCalledWith(
      userEntityFixture.email,
    );
  };

  const expectIdLookup = () => {
    expect(usersServiceMock.findByUserId).toHaveBeenCalledWith(
      userEntityFixture.id,
    );
  };

  describe('validate', () => {
    it('should get user by email', async () => {
      usersServiceMock.finEmail.mockResolvedValue(userEntityFixture);

      const validatedUser = (await userByEmail()).get();

      expectEmailLookup();
      expect(validatedUser).toEqual(userEntityFixture);
    });

    it('should throw user not found when email does not exist', async () => {
      usersServiceMock.finEmail.mockResolvedValue(null);

      await expect(userByEmail()).rejects.toThrow(UserNotFoundException);
      expectEmailLookup();
    });

    it('should keep user in chain state after exists', async () => {
      usersServiceMock.finEmail.mockResolvedValue(userEntityFixture);

      const validationChain = await userByEmail();

      expect(validationChain.isActive().get()).toEqual(userEntityFixture);
      expect(usersServiceMock.finEmail).toHaveBeenCalledTimes(1);
    });

    it('should throw user not active when user is inactive', async () => {
      usersServiceMock.finEmail.mockResolvedValue(inactiveUserEntityFixture);
      const validationChain = await userByEmail();

      expect(() => {
        validationChain.isActive();
      }).toThrow(UserNotActiveException);
    });

    it('should not call id lookup when validating by email', async () => {
      usersServiceMock.finEmail.mockResolvedValue(userEntityFixture);

      await userByEmail();

      expect(usersServiceMock.findByUserId).not.toHaveBeenCalled();
    });
  });

  describe('validateByUserId', () => {
    it('should get user by id', async () => {
      usersServiceMock.findByUserId.mockResolvedValue(userEntityFixture);

      const validatedUser = (await userById()).get();

      expectIdLookup();
      expect(validatedUser).toEqual(userEntityFixture);
    });

    it('should throw user not found when id does not exist', async () => {
      usersServiceMock.findByUserId.mockResolvedValue(null);

      await expect(userById()).rejects.toThrow(UserNotFoundException);
      expectIdLookup();
    });

    it('should throw user not active after id lookup when user is inactive', async () => {
      usersServiceMock.findByUserId.mockResolvedValue(
        inactiveUserEntityFixture,
      );
      const validationChain = await userById();

      expect(() => {
        validationChain.isActive();
      }).toThrow(UserNotActiveException);
    });

    it('should not call email lookup when validating by id', async () => {
      usersServiceMock.findByUserId.mockResolvedValue(userEntityFixture);

      await userById();

      expect(usersServiceMock.finEmail).not.toHaveBeenCalled();
    });
  });

  describe('doesNotExist', () => {
    it('should allow flow when user does not exist', async () => {
      usersServiceMock.finEmail.mockResolvedValue(null);

      await expect(
        builder.validate(userEntityFixture.email).doesNotExist(),
      ).resolves.toBeUndefined();
      expectEmailLookup();
    });

    it('should throw user already exists when email exists', async () => {
      usersServiceMock.finEmail.mockResolvedValue(userEntityFixture);

      await expect(
        builder.validate(userEntityFixture.email).doesNotExist(),
      ).rejects.toThrow(UserAlreadyExistsException);
      expectEmailLookup();
    });
  });

  describe('wasCreated', () => {
    it('should get created user', async () => {
      usersServiceMock.finEmail.mockResolvedValue(userEntityFixture);

      const createdUser = (
        await builder.validate(userEntityFixture.email).wasCreated()
      ).get();

      expectEmailLookup();
      expect(createdUser).toEqual(userEntityFixture);
    });

    it('should throw user creation failed when created user is not found', async () => {
      usersServiceMock.finEmail.mockResolvedValue(null);

      await expect(
        builder.validate(userEntityFixture.email).wasCreated(),
      ).rejects.toThrow(UserCreationFailedException);
      expectEmailLookup();
    });
  });
});
